import React, { useState } from "react";
import {
	useClients,
	type Client,
	type CreateClientDto,
	type SearchField,
} from "../hooks/useClients";
import { useAuth } from "../context/AuthContext";
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
} from "@/components/ui/dialog";
import {
	Plus,
	Loader2,
	Search,
	Pencil,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Users,
	AlertCircle,
} from "lucide-react";

/**
 * Extrae un mensaje de error legible de diferentes tipos de errores
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	if (typeof error === "object" && error !== null) {
		const obj = error as Record<string, unknown>;
		if (obj.message && typeof obj.message === "string") {
			return obj.message;
		}
		if (obj.error && typeof obj.error === "string") {
			return obj.error;
		}
	}
	return "Error desconocido al cargar los clientes";
}

// Opciones de cantidad de registros
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30] as const;

// Mapping de labels para búsqueda
const SEARCH_FIELD_LABELS: Record<string, string> = {
	all: "Buscar por todos los campos...",
	id: "Buscar por ID...",
	name: "Buscar por nombre...",
	email: "Buscar por email...",
	phone: "Buscar por teléfono...",
};

export const ClientsPage: React.FC = () => {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(15);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [searchField, setSearchField] = useState<SearchField>("all");
	const [currentPageInput, setCurrentPageInput] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingClient, setEditingClient] = useState<Client | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
	const [operationError, setOperationError] = useState<string | null>(null);

	const {
		clients,
		total,
		totalPages,
		isLoading,
		error,
		createClient,
		updateClient,
		deleteClient,
		isCreating,
		isUpdating,
		isDeleting,
	} = useClients(page, limit, search, searchField);

	const { user } = useAuth();
	const isAdmin = user?.role === "ADMINISTRATOR";

	const [formData, setFormData] = useState<CreateClientDto>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
	});

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

	const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setLimit(Number(e.target.value));
		setPage(1);
	};

	const handleSearchFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSearchField(e.target.value as SearchField);
		setSearch("");
		setSearchInput("");
	};

	const openCreateDialog = () => {
		setEditingClient(null);
		setFormData({
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			address: "",
		});
		setIsDialogOpen(true);
		setOperationError(null);
	};

	const openEditDialog = (client: Client) => {
		setEditingClient(client);
		setFormData({
			firstName: client.firstName,
			lastName: client.lastName,
			email: client.email,
			phone: client.phone || "",
			address: client.address || "",
		});
		setIsDialogOpen(true);
		setOperationError(null);
	};

	const openDeleteDialog = (client: Client) => {
		setClientToDelete(client);
		setIsDeleteDialogOpen(true);
		setOperationError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setOperationError(null);
		try {
			if (editingClient) {
				await updateClient(editingClient.id, formData);
			} else {
				await createClient(formData);
			}
			setIsDialogOpen(false);
			setOperationError(null);
		} catch (err) {
			const errorMessage = getErrorMessage(err);
			setOperationError(errorMessage);
			console.error("Error en operación:", err);
		}
	};

	const handleDelete = async () => {
		if (clientToDelete) {
			setOperationError(null);
			try {
				await deleteClient(clientToDelete.id);
				setIsDeleteDialogOpen(false);
				setClientToDelete(null);
				setOperationError(null);
			} catch (err) {
				const errorMessage = getErrorMessage(err);
				setOperationError(errorMessage);
				console.error("Error al eliminar:", err);
			}
		}
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
		const errorMessage = getErrorMessage(error);
		return (
			<div className="flex flex-col items-center justify-center h-[400px] gap-4">
				<div className="flex items-center gap-3 text-destructive">
					<AlertCircle className="size-6" />
					<div>
						<p className="font-bold text-lg">Error al cargar clientes</p>
						<p className="text-sm text-muted-foreground">{errorMessage}</p>
					</div>
				</div>
				<Button onClick={() => window.location.reload()} variant="outline">
					Reintentar
				</Button>
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
							Clientes
						</h1>
						<p className="text-muted-foreground">
							Administra tu cartera de clientes
						</p>
					</div>
				</div>
				{isAdmin && (
					<Button
						onClick={openCreateDialog}
						className="font-bold uppercase tracking-tight"
					>
						<Plus className="mr-2 size-4" /> Nuevo Cliente
					</Button>
				)}
			</div>

			{/* Table Card */}
			<Card className="border-none shadow-sm">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
							Listado de Clientes ({total})
						</CardTitle>
						<form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
							{/* Selector de campo de búsqueda */}
							<select
								value={searchField}
								onChange={handleSearchFieldChange}
								className="h-9 px-3 rounded-lg border border-input bg-background text-sm font-medium cursor-pointer hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[100px]"
							>
								<option value="all">Todos</option>
								<option value="id">ID</option>
								<option value="name">Nombre</option>
								<option value="email">Email</option>
								<option value="phone">Teléfono</option>
							</select>

							{/* Input de búsqueda */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									placeholder={SEARCH_FIELD_LABELS[searchField]}
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
									<th className="px-6 py-4 font-black">ID</th>
									<th className="px-6 py-4 font-black">Nombre</th>
									<th className="px-6 py-4 font-black">Email</th>
									<th className="px-6 py-4 font-black">Telefono</th>
									<th className="px-6 py-4 font-black">Direccion</th>
									<th className="px-6 py-4 font-black text-center">Estado</th>
									<th className="px-6 py-4 font-black text-center">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/50">
								{clients.map((client) => (
									<tr
										key={client.id}
										className="bg-transparent hover:bg-muted/20 transition-colors"
									>
										<td className="px-6 py-4 font-medium text-muted-foreground">
											#{client.id}
										</td>
										<td className="px-6 py-4 font-bold text-foreground">
											{client.firstName} {client.lastName}
										</td>
										<td className="px-6 py-4 text-muted-foreground">
											{client.email}
										</td>
										<td className="px-6 py-4 text-muted-foreground">
											{client.phone || "-"}
										</td>
										<td className="px-6 py-4 text-muted-foreground">
											{client.address || "-"}
										</td>
										<td className="px-6 py-4 text-center">
											<Badge
												variant={client.isActive ? "default" : "secondary"}
											>
												{client.isActive ? "Activo" : "Inactivo"}
											</Badge>
										</td>
										<td className="px-6 py-4 text-center">
											<div className="flex items-center justify-center gap-1">
												{isAdmin && (
													<>
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => openEditDialog(client)}
														>
															<Pencil className="size-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => openDeleteDialog(client)}
															className="text-destructive hover:text-destructive"
														>
															<Trash2 className="size-4" />
														</Button>
													</>
												)}
											</div>
										</td>
									</tr>
								))}
								{clients.length === 0 && (
									<tr>
										<td
											colSpan={7}
											className="px-6 py-10 text-center text-muted-foreground italic"
										>
											No hay clientes registrados
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{totalPages > 0 && (
						<div className="flex flex-wrap items-center justify-between mt-4 pt-4 gap-4">
							{/* Selector de cantidad de registros */}
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Mostrar</span>
								<select
									value={limit}
									onChange={handleLimitChange}
									className="h-8 px-2 rounded border border-input bg-background text-sm font-medium cursor-pointer hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/20 w-16 text-center"
								>
									{PAGE_SIZE_OPTIONS.map((size) => (
										<option key={size} value={size}>
											{size}
										</option>
									))}
								</select>
								<span className="text-sm text-muted-foreground">
									por página
								</span>
							</div>

							<p className="text-sm text-muted-foreground">
								Página {page} de {totalPages} ({total} clientes)
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

			{/* Create/Edit Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingClient ? "Editar Cliente" : "Nuevo Cliente"}
						</DialogTitle>
					</DialogHeader>
					{operationError && (
						<div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
							<AlertCircle className="size-4 flex-shrink-0" />
							{operationError}
						</div>
					)}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Nombre</label>
							<Input
								value={formData.firstName}
								onChange={(e) =>
									setFormData({
										...formData,
										firstName: e.target.value.slice(0, 15),
									})
								}
								required
								placeholder="Juan"
								maxLength={15}
							/>
							<span className="text-xs text-muted-foreground">
								{formData.firstName.length}/15
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
							<label className="text-sm font-medium">
								Telefono (solo numeros)
							</label>
							<Input
								value={formData.phone}
								onChange={(e) => {
									const num = e.target.value.replace(/\D/g, "").slice(0, 10);
									setFormData({ ...formData, phone: num });
								}}
								placeholder="0991234567"
								maxLength={10}
							/>
							<span className="text-xs text-muted-foreground">
								{(formData.phone || "").length}/10 numeros
							</span>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Direccion</label>
							<Input
								value={formData.address}
								onChange={(e) =>
									setFormData({
										...formData,
										address: e.target.value.slice(0, 50),
									})
								}
								placeholder="Calle 123 #45-67"
								maxLength={50}
							/>
							<span className="text-xs text-muted-foreground">
								{(formData.address || "").length}/50
							</span>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsDialogOpen(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={isCreating || isUpdating}>
								{isCreating || isUpdating ? (
									<>
										<Loader2 className="size-4 mr-2 animate-spin" />{" "}
										Guardando...
									</>
								) : editingClient ? (
									"Actualizar"
								) : (
									"Crear"
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Eliminar Cliente</DialogTitle>
					</DialogHeader>
					{operationError && (
						<div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
							<AlertCircle className="size-4 flex-shrink-0" />
							{operationError}
						</div>
					)}
					<p className="text-sm text-muted-foreground">
						Seguro que deseas eliminar a{" "}
						<strong>
							{clientToDelete?.firstName} {clientToDelete?.lastName}
						</strong>
						? Esta accion no se puede deshacer.
					</p>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<Loader2 className="size-4 mr-2 animate-spin" /> Eliminando...
								</>
							) : (
								"Eliminar"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};