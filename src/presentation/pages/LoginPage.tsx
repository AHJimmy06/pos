import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, type User } from "../context/AuthContext";
import { apiClient } from "@/infrastructure/api/api-client";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShoppingCart, LogIn, AlertCircle } from "lucide-react";
import type { AxiosResponse } from "axios";

interface LoginPayload {
	accessToken: string;
	expiresIn: number;
}

interface LoginApiResponse {
	success: boolean;
	statusCode: number;
	timestamp: string;
	path: string;
	data: LoginPayload;
}

interface LocationState {
	from?: {
		pathname: string;
	};
}

// Helper para extraer payload de respuestas NestJS
function getPayload<T>(response: AxiosResponse): T | null {
	const data = response?.data;
	if (!data) return null;

	// Si tiene estructura NestJS wrapper { success, data: ... }
	if (data.success !== undefined && data.data !== undefined) {
		return data.data as T;
	}

	// Si no tiene wrapper
	return data as T;
}

interface MeResponse {
	success: boolean;
	data: Omit<User, "role" | "fullName">;
}

export const LoginPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingUser, setIsLoadingUser] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState;
	const from = state?.from?.pathname || "/";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			// Paso 1: autenticación → token
			const response = await apiClient.post<LoginApiResponse>("/auth/login", {
				email,
				password,
			});

			const payload = getPayload<LoginPayload>(response);
			if (!payload?.accessToken) {
				throw new Error("Token no recibido del servidor");
			}

			const { accessToken } = payload;
			localStorage.setItem("pos_token", accessToken);

			// Paso 2: cargar el usuario real desde el backend
			// (no inferimos rol desde el email; el servidor es la fuente de verdad)
			setIsLoadingUser(true);
			const meResponse = await apiClient.get<MeResponse>("/auth/me");
			const me = getPayload<Omit<User, "role" | "fullName">>(meResponse);
			if (!me) {
				throw new Error("No se pudo obtener la información del usuario");
			}

			login(accessToken, me as User);

			navigate(from, { replace: true });
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Credenciales inválidas";
			console.error("Login error:", errorMessage);
			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
			setIsLoadingUser(false);
		}
	};

	const isBusy = isSubmitting || isLoadingUser;

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
			<div className="w-full max-w-md">
				<div className="flex justify-center mb-8">
					<div className="flex items-center gap-3">
						<div className="bg-primary p-3 rounded-xl text-primary-foreground shadow-lg">
							<ShoppingCart className="size-8" />
						</div>
						<div>
							<h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">
								Gentleman POS
							</h1>
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
								Inicia Sesión
							</p>
						</div>
					</div>
				</div>

				<Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-xl font-bold">Bienvenido</CardTitle>
						<CardDescription>
							Ingresa tus credenciales para acceder al sistema
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-4">
							{error && (
								<div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
									<AlertCircle className="size-4" />
									{error}
								</div>
							)}
							<div className="space-y-2">
								<Label htmlFor="email">Correo Electrónico</Label>
								<Input
									id="email"
									type="email"
									placeholder="admin@gentleman.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="bg-background/50"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Contraseña</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="bg-background/50"
								/>
								<p className="text-[10px] text-muted-foreground">
									8-10 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y
									1 carácter especial (@$!%*?&)
								</p>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								type="submit"
								className="w-full font-bold uppercase tracking-tight"
								disabled={isBusy}
							>
								{isBusy ? (
									"Iniciando..."
								) : (
									<>
										<LogIn className="mr-2 size-4" /> Entrar al Sistema
									</>
								)}
							</Button>
						</CardFooter>
					</form>
				</Card>

				<p className="mt-8 text-center text-xs text-muted-foreground">
					&copy; 2026 Gentleman POS - Sistema de Gestión Empresarial
				</p>
			</div>
		</div>
	);
};
