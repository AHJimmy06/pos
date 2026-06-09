import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import { apiClient } from "@/infrastructure/api/api-client";

export type UserRole = "ADMINISTRATOR" | "SELLER";

export interface User {
	id: number;
	username: string;
	name: string;
	lastName: string;
	email: string;
	cedula?: string | null;
	isActive: boolean;
	roles: UserRole[];
	/** Derived: convenience for components that want a single role. */
	role: UserRole;
	/** Derived: convenience for sidebar greeting. */
	fullName: string;
}

const deriveUser = (raw: Omit<User, "role" | "fullName">): User => {
	const firstRole = (raw.roles?.[0] ?? "SELLER") as UserRole;
	return {
		...raw,
		role: firstRole,
		fullName: `${raw.name} ${raw.lastName}`.trim(),
	};
};

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (token: string, user: User) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Unwraps the NestJS success wrapper produced by the backend response interceptor
 * ({ success, statusCode, data }). Falls back to the raw payload.
 */
const unwrapAuthPayload = <T,>(response: unknown): T => {
	const data = (response as { data?: unknown })?.data;
	if (
		data &&
		typeof data === "object" &&
		"success" in data &&
		(data as { success?: unknown }).success === true &&
		"data" in data
	) {
		return (data as { data: T }).data;
	}
	return data as T;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(() => {
		const saved = localStorage.getItem("pos_user");
		try {
			const parsed = saved ? (JSON.parse(saved) as User) : null;
			if (parsed && !parsed.role && parsed.roles?.length) {
				return deriveUser(parsed as Omit<User, "role" | "fullName">);
			}
			return parsed;
		} catch {
			return null;
		}
	});

	const [token, setToken] = useState<string | null>(() => {
		return localStorage.getItem("pos_token");
	});

	const [isLoading, setIsLoading] = useState(false);

	const logout = useCallback(() => {
		setToken(null);
		setUser(null);
		localStorage.removeItem("pos_token");
		localStorage.removeItem("pos_user");
	}, []);

	const login = useCallback((newToken: string, newUser: User) => {
		setToken(newToken);
		const normalized = deriveUser(newUser as Omit<User, "role" | "fullName">);
		setUser(normalized);
		localStorage.setItem("pos_token", newToken);
		localStorage.setItem("pos_user", JSON.stringify(normalized));
	}, []);

	// On mount: if we have a token but no user (or stale localStorage), fetch /auth/me
	// so the sidebar and protected routes reflect the real server-side roles.
	useEffect(() => {
		let cancelled = false;
		const storedToken = localStorage.getItem("pos_token");
		if (!storedToken) return;

		const loadCurrentUser = async () => {
			setIsLoading(true);
			try {
				const res = await apiClient.get("/auth/me");
				const me = unwrapAuthPayload<Omit<User, "role" | "fullName">>(res);
				if (!cancelled && me) {
					const normalized = deriveUser(me);
					setUser(normalized);
					localStorage.setItem("pos_user", JSON.stringify(normalized));
				}
			} catch {
				if (!cancelled) {
					logout();
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		};

		void loadCurrentUser();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const value = {
		user,
		token,
		isAuthenticated: !!token,
		isLoading,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
