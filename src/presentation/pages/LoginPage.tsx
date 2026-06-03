import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";
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
import { ShoppingCart, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";

interface LoginResponse {
	accessToken: string;
	expiresIn: number;
}

interface LocationState {
	from?: {
		pathname: string;
	};
}

// Helper para extraer payload de respuestas NestJS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPayload<T>(response: any): T | null {
	const data = response?.data;
	if (!data) return null;
	if (data.success !== undefined && data.data !== undefined) {
		const inner = data.data;
		if (
			inner &&
			typeof inner === "object" &&
			"data" in inner &&
			"total" in inner
		) {
			return inner as T;
		}
		return inner as T;
	}
	return data as T;
}

export const LoginPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
			// Llamada al endpoint de la API
			const response = await apiClient.post<unknown, LoginResponse>(
				"/auth/login",
				{ email, password },
			);
			const payload = getPayload<LoginResponse>(response);
			if (!payload) throw new Error("Credenciales inválidas");

			const { accessToken } = payload;

			// Simulación de usuario basado en roles comunes para la demo
			const mockUser = {
				id: "1",
				username: email.split("@")[0],
				role: (email.includes("admin")
					? "ADMINISTRATOR"
					: "SELLER") as UserRole,
				fullName: email.includes("admin")
					? "Administrador Sistema"
					: "Vendedor Usuario",
			};

			login(accessToken, mockUser);
			navigate(from, { replace: true });
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Credenciales inválidas";
			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

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
								<div className="relative">
									<Input
										id="email"
										type="email"
										placeholder="admin@gentleman.com"
										value={email}
										onChange={(e) => setEmail(e.target.value.slice(0, 40))}
										required
										className="bg-background/50 pr-10"
										maxLength={40}
									/>
									<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
										{email.length}/40
									</span>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Contraseña</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										className="bg-background/50 pr-10"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label={
											showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
										}
									>
										{showPassword ? (
											<EyeOff className="size-4" />
										) : (
											<Eye className="size-4" />
										)}
									</button>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								type="submit"
								className="w-full font-bold uppercase tracking-tight"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
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
