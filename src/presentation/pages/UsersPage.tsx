import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	UserPlus,
	ShieldAlert,
	Loader2,
	UserX,
	UserCheck,
	Lock,
	ChevronLeft,
	ChevronRight,
	Users,
	Search,
	Pencil,
} from "lucide-react";

interface User {
	id: number;
	username: string;
	name: string;
	lastName: string;
	email: string;
	isActive: boolean;
	roles: string[];
}

interface UsersResponse {
	data: User[];
	total: number;
}

export const UsersPage: React.FC = () => {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [currentPageInput, setCurrentPageInput] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingUserId, setEditingUserId] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		username: "",
		name: "",
		lastName: "",
		email: "",
		password: "",
		roles: ["SELLER"],
	});

	const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

	const queryClient = useQueryClient();

	const handleUnlock = async (userId: number) => {
		if (!confirm("¿Desbloquear este usuario?")) return;
		setLoadingUserId(userId);
		try {
			await apiClient.post(`/users/${userId}/unlock`);
			queryClient.invalidateQueries({ queryKey: ["users"] });
		} catch (err) {
			console.error("Error desbloqueando usuario:", err);
			alert("No se pudo desbloquear el usuario");
		} finally {
			setLoadingUserId(null);
		}
	};

	const handleToggleActive = async (user: User) => {
		const action = user.isActive ? "desactivar" : "activar";
		const label = action.charAt(0).toUpperCase() + action.slice(1);
		if (!confirm(`¿${label} este usuario?`)) return;
		setLoadingUserId(user.id);
		try {
			await apiClient.put(`/users/${user.id}`, { isActive: !user.isActive });
			queryClient.invalidateQueries({ queryKey: ["users"] });
		} catch (err) {
			console.error(`Error al ${action} usuario:`, err);
			alert(`No se pudo ${action} el usuario`);
		} finally {
			setLoadingUserId(null);
		}
	};

	const { data, isLoading, error } = useQuery<UsersResponse>({
		queryKey: ["users", { page, search }],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: String(page),
				limit: "15",
			});
			if (search) {
				params.append("search", search);
			}
			const res = await apiClient.get<UsersResponse>(`/users?${params}`);
			// interceptor preserves NestJS wrapper in res.data → unwrap it
			const wrapper = res.data as { data?: unknown };
			const inner = wrapper?.data;
			if (inner && typeof inner === "object" && "data" in inner) {
				return inner as UsersResponse;
			}
			return { data: [], total: 0 };
		},
	});

	const users: User[] = data?.data ?? [];
	const total: number = data?.total ?? 0;
	const totalPages = Math.ceil(total / 15);

	const openEditDialog = (user: User) => {
		setFormData({
			username: user.username,
			name: user.name,
			lastName: user.lastName,
			email: user.email,
			password: "", // No se edita pass por aquÃ­
			roles: user.roles,
		});
		setEditingUserId(user.id);
		setIsEditMode(true);
		setIsDialogOpen(true);
	};

	const openCreateDialog = () => {
		setIsEditMode(false);
		setEditingUserId(null);
		setFormData({
			username: "",
			name: "",
			lastName: "",
			email: "",
			password: "",
			roles: ["SELLER"],
		});
		setIsDialogOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			if (isEditMode && editingUserId) {
				await apiClient.put(`/users/${editingUserId}`, {
					username: formData.username,
					name: formData.name,
					lastName: formData.lastName,
					email: formData.email,
				});
			} else {
				await apiClient.post("/auth/register", {
					username: formData.username,
					name: formData.name,
					lastName: formData.lastName,
					email: formData.email,
					password: formData.password,
					roles: formData.roles,
				});
			}
			setIsDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ["users"] });
		} catch (err) {
			console.error("Error en la operaciÃ³n:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearch(searchInput);
		setPage(1);
	};

	const handlePageInputSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const pageNum = parseInt(currentPageInput, 10);
		if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
			setPage(pageNum);
		}
		setCurrentPageInput("");
	};

	// Generate visible page numbers (show up to 7 pages with ellipsis)
	const getVisiblePages = () => {
		const pageList: (number | "...")[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pageList.push(i);
		} else {
			pageList.push(1);
			if (page > 3) pageList.push("...");
			for (
				let i = Math.max(2, page - 1);
				i <= Math.min(totalPages - 1, page + 1);
				i++
			) {
				pageList.push(i);
			}
			if (page < totalPages - 2) pageList.push("...");
			pageList.push(totalPages);
		}
		return pageList;
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[400px]">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-[400px] text-destructive">
				<p className="font-bold">Error al cargar usuarios</p>
				<p className="text-sm">{(error as Error).message}</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="bg-primary p-2 rounded-lg text-primary-foreground">
						<Users className="size-5" />
					</div>
					<div>
						<h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
							Usuarios
						</h1>
						<p className="text-muted-foreground">
							Gestión de personal y permisos
						</p>
					</div>
				</div>
				<Button
					className="font-bold uppercase tracking-tight"
					onClick={openCreateDialog}
				>
					<UserPlus className="mr-2 size-4" /> Registrar Usuario
				</Button>
			</div>

			{/* Alert */}
			<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4 text-amber-700">
				<div className="bg-amber-500/20 p-2 rounded-lg">
					<ShieldAlert className="size-5" />
				</div>
				<div>
					<p className="text-sm font-bold">Control de Bloqueos</p>
					<p className="text-xs font-medium opacity-80">
						Recuerda que los usuarios se bloquean tras 3 intentos fallidos.
						Puedes desbloquearlos desde la tabla.
					</p>
				</div>
			</div>

			{/* Table Card */}
			<Card className="border-none shadow-sm">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
							Personal del Sistema ({total})
						</CardTitle>
						<form onSubmit={handleSearch} className="flex gap-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									placeholder="Buscar por nombre o email..."
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									className="pl-10 w-64"
								/>
							</div>
							<Button type="submit" variant="secondary" size="sm">
								Buscar
							</Button>
						</form>
					</div>
				</CardHeader>
				<CardContent>
					{/* Table */}
					<div className="relative overflow-x-auto rounded-xl border border-border/50">
						<table className="w-full text-sm text-left">
							<thead className="text-xs text-muted-foreground uppercase bg-muted/30">
								<tr>
									<th className="px-6 py-4 font-black">Usuario</th>
									<th className="px-6 py-4 font-black">Nombre Completo</th>
									<th className="px-6 py-4 font-black">Correo</th>
									<th className="px-6 py-4 font-black text-center">Roles</th>
									<th className="px-6 py-4 font-black text-center">Estado</th>
									<th className="px-6 py-4 font-black text-right">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/50">
								{users.map((u) => (
									<tr key={u.id} className="bg-transparent hover:bg-muted/20">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
													{(u.username || "U").charAt(0).toUpperCase()}
												</div>
												<span className="font-bold">{u.username}</span>
											</div>
										</td>
										<td className="px-6 py-4">
											{u.name} {u.lastName}
										</td>
										<td className="px-6 py-4 text-muted-foreground">
											{u.email}
										</td>
										<td className="px-6 py-4 text-center">
											<div className="flex flex-wrap justify-center gap-1">
												{u.roles.length > 0 ? (
													u.roles.map((role) => (
														<span
															key={role}
															className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase"
														>
															{role}
														</span>
													))
												) : (
													<span className="text-muted-foreground text-xs">
														Sin rol
													</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 text-center">
											<Badge variant={u.isActive ? "default" : "secondary"}>
												{u.isActive ? "Activo" : "Inactivo"}
											</Badge>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-center gap-1 float-right">
												<Button
													variant="ghost"
													size="icon"
													className="size-8 text-blue-600"
													onClick={() => openEditDialog(u)}
												>
													<Pencil className="size-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="size-8"
													onClick={() => handleUnlock(u.id)}
													disabled={loadingUserId === u.id}
													title="Desbloquear usuario"
												>
													<Lock className="size-4" />
												</Button>
												{u.isActive ? (
													<Button
														variant="ghost"
														size="icon"
														className="size-8 text-destructive"
														onClick={() => handleToggleActive(u)}
														disabled={loadingUserId === u.id}
														title="Desactivar usuario"
													>
														<UserX className="size-4" />
													</Button>
												) : (
													<Button
														variant="ghost"
														size="icon"
														className="size-8 text-emerald-600"
														onClick={() => handleToggleActive(u)}
														disabled={loadingUserId === u.id}
														title="Activar usuario"
													>
														<UserCheck className="size-4" />
													</Button>
												)}
											</div>
										</td>
									</tr>
								))}
								{users.length === 0 && (
									<tr>
										<td
											colSpan={6}
											className="px-6 py-10 text-center text-muted-foreground"
										>
											No hay usuarios registrados
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex flex-wrap items-center justify-between mt-4 pt-4 gap-4">
							<p className="text-sm text-muted-foreground">
								PÃ¡gina {page} de {totalPages} ({total} usuarios)
							</p>
							<div className="flex items-center gap-2">
								{/* Anterior */}
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									<ChevronLeft className="size-4" />
								</Button>

								{/* Page Numbers */}
								<div className="flex items-center gap-1">
									{getVisiblePages().map((p, idx) =>
										p === "..." ? (
											<span
												key={`ellipsis-${idx}`}
												className="px-2 text-muted-foreground"
											>
												...
											</span>
										) : (
											<Button
												key={p}
												variant={page === p ? "default" : "ghost"}
												size="sm"
												onClick={() => setPage(p)}
												className="w-9"
											>
												{p}
											</Button>
										),
									)}
								</div>

								{/* Siguiente */}
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
								>
									<ChevronRight className="size-4" />
								</Button>

								{/* Jump to Page */}
								<div className="h-8 w-px bg-border mx-1" />
								<form
									onSubmit={handlePageInputSubmit}
									className="flex items-center gap-1"
								>
									<Input
										type="number"
										min={1}
										max={totalPages}
										placeholder="Pg"
										value={currentPageInput}
										onChange={(e) => setCurrentPageInput(e.target.value)}
										className="w-16 h-8 text-center"
									/>
									<Button type="submit" variant="secondary" size="sm">
										Ir
									</Button>
								</form>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* User Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{isEditMode ? "Editar Usuario" : "Registrar Nuevo Usuario"}
						</DialogTitle>
						<DialogDescription>
							{isEditMode
								? "Modifica los datos del usuario. La contraseña no se puede cambiar desde aquí."
								: "Complete los datos del nuevo usuario."}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Usuario</label>
							<Input
								value={formData.username}
								onChange={(e) =>
									setFormData({
										...formData,
										username: e.target.value.slice(0, 20),
									})
								}
								required
								placeholder="juan.perez"
								maxLength={20}
							/>
							<span className="text-xs text-muted-foreground">
								{formData.username.length}/20
							</span>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Nombre</label>
								<Input
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value.slice(0, 15),
										})
									}
									required
									placeholder="Juan"
									maxLength={15}
								/>
								<span className="text-xs text-muted-foreground">
									{formData.name.length}/15
								</span>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Apellido</label>
								<Input
									value={formData.lastName}
									onChange={(e) =>
										setFormData({
											...formData,
											lastName: e.target.value.slice(0, 15),
										})
									}
									required
									placeholder="Perez"
									maxLength={15}
								/>
								<span className="text-xs text-muted-foreground">
									{formData.lastName.length}/15
								</span>
							</div>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Email</label>
							<Input
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({
										...formData,
										email: e.target.value.slice(0, 40),
									})
								}
								required
								placeholder="juan@email.com"
								maxLength={40}
							/>
							<span className="text-xs text-muted-foreground">
								{formData.email.length}/40
							</span>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Contraseña</label>
							<Input
								type="password"
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
								required={!isEditMode}
								disabled={isEditMode}
								placeholder={
									isEditMode
										? "No se puede editar desde aquí"
										: "Mínimo 8 caracteres"
								}
								minLength={isEditMode ? 0 : 8}
							/>
							{!isEditMode && (
								<p className="text-[10px] text-muted-foreground">
									8-10 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y
									1 carácter especial (@$!%*?&)
								</p>
							)}
						</div>
						{!isEditMode && (
							<div className="space-y-2">
								<label className="text-sm font-medium">Rol</label>
								<select
									value={formData.roles[0]}
									onChange={(e) =>
										setFormData({ ...formData, roles: [e.target.value] })
									}
									className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium cursor-pointer hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
								>
									<option value="SELLER">Vendedor</option>
									<option value="ADMINISTRATOR">Administrador</option>
								</select>
							</div>
						)}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsDialogOpen(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="size-4 mr-2 animate-spin" />
										{isEditMode ? "Guardando..." : "Registrando..."}
									</>
								) : isEditMode ? (
									"Guardar Cambios"
								) : (
									"Registrar"
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};
