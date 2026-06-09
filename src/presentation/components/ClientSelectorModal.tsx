import React, { useState, useMemo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";
import { useClients, type Client, type SearchField } from "../hooks/useClients";
import { usePOSStore } from "../store/usePOSStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
	DropdownSelector,
	type DropdownOption,
} from "@/components/ui/dropdown-selector";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	User,
	Search,
	X,
	Loader2,
	ChevronLeft,
	ChevronRight,
	Check,
	Plus,
} from "lucide-react";

const cn = (...classes: (string | boolean | undefined)[]) =>
	classes.filter(Boolean).join(" ");

interface ClientSelectorModalProps {
	triggerClassName?: string;
}

const SEARCH_FIELD_LABELS: Record<string, string> = {
	all: "Todos",
	id: "ID",
	name: "Nombre",
	email: "Email",
	phone: "Teléfono",
};

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30] as const;

interface NewClientForm {
	firstName: string;
	lastName: string;
	phone: string;
	address: string;
	email: string;
}

const EMPTY_FORM: NewClientForm = {
	firstName: "",
	lastName: "",
	phone: "",
	address: "",
	email: "",
};

export const ClientSelectorModal: React.FC<ClientSelectorModalProps> = ({
	triggerClassName,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState<number>(10);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [searchField, setSearchField] = useState<SearchField>("all");
	const [currentPageInput, setCurrentPageInput] = useState("");

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [createForm, setCreateForm] = useState<NewClientForm>(EMPTY_FORM);

	const queryClient = useQueryClient();
	const { selectedClient, setSelectedClient, clear } = usePOSStore();
	const { clients, total, totalPages, isLoading } = useClients(
		page,
		limit,
		search,
		searchField,
	);

	const createClientMutation = useMutation({
		mutationFn: async (data: NewClientForm) => {
			const res = await apiClient.post("/clients", data);
			return res.data;
		},
		onSuccess: async (response) => {
			// Unwrap nested data if present
			const created = (
				response && typeof response === "object" && "data" in response
					? (response as { data: unknown }).data
					: response
			) as (Client & { id: number }) | undefined;
			setIsCreateOpen(false);
			setCreateForm(EMPTY_FORM);
			await queryClient.invalidateQueries({ queryKey: ["clients"] });
			// Auto-select the newly created client
			if (created && created.id) {
				setSelectedClient(
					created as unknown as Parameters<typeof setSelectedClient>[0],
				);
				setIsOpen(false);
				setSearch("");
				setPage(1);
				setSearchInput("");
			}
		},
		onError: (err) => {
			console.error("Error creando cliente:", err);
			alert(
				"No se pudo crear el cliente. Verifica los datos e intenta nuevamente.",
			);
		},
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

	const handleSelectClient = (client: Client) => {
		setSelectedClient(client);
		setIsOpen(false);
		setSearch("");
		setPage(1);
		setSearchInput("");
	};

	const handleClear = () => {
		clear();
		setSearch("");
		setPage(1);
		setSearchInput("");
	};

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

	const searchOptions: DropdownOption[] = useMemo(
		() =>
			Object.entries(SEARCH_FIELD_LABELS).map(([id, label]) => ({
				id,
				label,
			})),
		[],
	);

	const selectedSearchFieldOption = useMemo(
		() =>
			searchOptions.find((opt) => opt.id === searchField) || searchOptions[0],
		[searchField, searchOptions],
	);

	return (
		<>
			{/* Trigger - shown when no client selected */}
			{!selectedClient && (
				<button
					onClick={() => setIsOpen(true)}
					className={cn(
						"w-full p-3 border-2 border-dashed border-muted rounded-xl text-center hover:border-primary/30 hover:bg-muted/20 transition-all",
						triggerClassName,
					)}
				>
					<p className="text-[10px] font-medium text-muted-foreground italic uppercase tracking-widest">
						Seleccionar Cliente
					</p>
				</button>
			)}

			{/* Selected Client Badge */}
			{selectedClient && (
				<div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border shadow-sm">
					<div className="bg-primary/10 p-1.5 rounded-lg text-primary">
						<User className="size-4" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
							Cliente Seleccionado
						</p>
						<p className="text-xs font-bold truncate text-foreground">
							{selectedClient.fullName ||
								`${selectedClient.firstName} ${selectedClient.lastName}`}
						</p>
					</div>
					<button
						onClick={handleClear}
						className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
						title="Quitar cliente"
					>
						<X className="size-4" />
					</button>
					<button
						onClick={() => setIsOpen(true)}
						className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
						title="Cambiar cliente"
					>
						<Search className="size-4" />
					</button>
				</div>
			)}

			{/* Modal */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						onClick={() => setIsOpen(false)}
					/>

					<div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-border">
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-border bg-background">
							<div className="flex items-center gap-3">
								<div className="bg-primary p-2 rounded-lg text-primary-foreground">
									<User className="size-5" />
								</div>
								<div>
									<h2 className="text-xl font-black tracking-tight uppercase text-foreground">
										Seleccionar Cliente
									</h2>
									<p className="text-xs text-muted-foreground font-medium">
										Búsqueda de clientes ({total} registros)
									</p>
								</div>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="p-2 rounded-lg hover:bg-muted transition-colors"
							>
								<X className="size-5" />
							</button>
						</div>

						{/* Inline new-client action */}
						<div className="px-4 pt-4 pb-2 border-b border-border bg-muted/20 flex justify-end">
							<Button
								size="sm"
								variant="outline"
								onClick={() => setIsCreateOpen(true)}
								className="h-9"
							>
								<Plus className="size-3 mr-1" /> Nuevo Cliente
							</Button>
						</div>

						{/* Search with Combobox */}
						<div className="p-4 border-b border-border bg-muted/20 space-y-4">
							<form
								onSubmit={handleSearch}
								className="flex gap-2 items-center flex-wrap"
							>
								<div className="w-64 shrink-0">
									<DropdownSelector
										options={searchOptions}
										selected={selectedSearchFieldOption}
										onSelect={(opt) => {
											setSearchField(opt.id as SearchField);
											setSearch("");
											setSearchInput("");
										}}
										placeholder="Filtrar por..."
										triggerHeight="sm"
									/>
								</div>
								<div className="relative flex-1 min-w-[200px]">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
									<Input
										placeholder={`Buscar por ${SEARCH_FIELD_LABELS[searchField].toLowerCase()}...`}
										value={searchInput}
										onChange={(e) => setSearchInput(e.target.value)}
										className="pl-10 h-10"
									/>
								</div>
								<Button type="submit" variant="secondary" className="h-10">
									Buscar
								</Button>
								{(search || searchInput) && (
									<Button
										type="button"
										variant="ghost"
										className="h-10"
										onClick={() => {
											setSearch("");
											setSearchInput("");
											setPage(1);
										}}
									>
										Limpiar
									</Button>
								)}
							</form>
						</div>

						{/* Client Table List */}
						<div className="flex-1 overflow-auto p-4 bg-background">
							{isLoading ? (
								<div className="flex items-center justify-center h-64">
									<Loader2 className="size-8 animate-spin text-primary" />
								</div>
							) : (
								<div className="relative overflow-x-auto rounded-xl border border-border/50">
									<table className="w-full text-sm text-left">
										<thead className="text-[10px] text-muted-foreground uppercase bg-muted/50 font-black tracking-widest">
											<tr>
												<th className="px-6 py-4">Nombre</th>
												<th className="px-6 py-4">Email</th>
												<th className="px-6 py-4 text-center">Estado</th>
												<th className="px-6 py-4 text-center">Acciones</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/50">
											{clients.map((client) => {
												const isSelected = selectedClient?.id === client.id;
												return (
													<tr
														key={client.id}
														className={cn(
															"bg-transparent hover:bg-muted/30 transition-colors",
															isSelected && "bg-primary/5",
														)}
													>
														<td className="px-6 py-4">
															<p className="font-bold text-foreground">
																{client.firstName} {client.lastName}
															</p>
														</td>
														<td className="px-6 py-4 text-muted-foreground font-medium">
															{client.email}
														</td>
														<td className="px-6 py-4 text-center">
															<Badge
																variant={
																	client.isActive ? "secondary" : "outline"
																}
																className="text-[10px] font-black uppercase tracking-tight"
															>
																{client.isActive ? "Activo" : "Inactivo"}
															</Badge>
														</td>
														<td className="px-6 py-4 text-center">
															<Button
																size="sm"
																variant={isSelected ? "default" : "secondary"}
																className="h-8 text-[10px] font-black uppercase tracking-tight"
																onClick={() => handleSelectClient(client)}
															>
																{isSelected ? (
																	<>
																		<Check className="size-3 mr-1" />
																		Seleccionado
																	</>
																) : (
																	"Seleccionar"
																)}
															</Button>
														</td>
													</tr>
												);
											})}
											{clients.length === 0 && (
												<tr>
													<td
														colSpan={4}
														className="px-6 py-10 text-center text-muted-foreground italic font-medium"
													>
														No se encontraron clientes
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							)}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex flex-wrap items-center justify-between p-4 border-t border-border bg-muted/10 gap-4">
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground">Mostrar</span>
									<select
										value={limit}
										onChange={(e) => {
											setLimit(Number(e.target.value));
											setPage(1);
										}}
										className="h-8 px-2 rounded border border-input bg-background text-xs font-bold w-16 text-center"
									>
										{PAGE_SIZE_OPTIONS.map((size) => (
											<option key={size} value={size}>
												{size}
											</option>
										))}
									</select>
									<span className="text-xs text-muted-foreground">
										por página
									</span>
								</div>
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Página {page} de {totalPages} ({total} clientes)
								</p>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										className="h-8"
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
									>
										<ChevronLeft className="size-4" />
									</Button>

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
													className="h-8 w-8 text-xs font-bold"
												>
													{p}
												</Button>
											),
										)}
									</div>

									<Button
										variant="outline"
										size="sm"
										className="h-8"
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										disabled={page === totalPages}
									>
										<ChevronRight className="size-4" />
									</Button>

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
											className="w-14 h-8 text-center text-xs p-0"
										/>
										<Button
											type="submit"
											variant="secondary"
											className="h-8 text-xs px-2 font-bold"
										>
											Ir
										</Button>
									</form>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Inline new-client dialog */}
			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Registrar Nuevo Cliente</DialogTitle>
						<DialogDescription>
							Complete los datos. El cliente se creará y quedará seleccionado
							automáticamente.
						</DialogDescription>
					</DialogHeader>
					<form
						className="space-y-3"
						onSubmit={(e) => {
							e.preventDefault();
							createClientMutation.mutate(createForm);
						}}
					>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="new-client-firstName">Nombre</Label>
								<Input
									id="new-client-firstName"
									value={createForm.firstName}
									onChange={(e) =>
										setCreateForm({ ...createForm, firstName: e.target.value })
									}
									required
									minLength={2}
									maxLength={100}
									placeholder="Juan"
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="new-client-lastName">Apellido</Label>
								<Input
									id="new-client-lastName"
									value={createForm.lastName}
									onChange={(e) =>
										setCreateForm({ ...createForm, lastName: e.target.value })
									}
									required
									minLength={2}
									maxLength={100}
									placeholder="Pérez"
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="new-client-phone">Teléfono</Label>
							<Input
								id="new-client-phone"
								value={createForm.phone}
								onChange={(e) =>
									setCreateForm({ ...createForm, phone: e.target.value })
								}
								required
								maxLength={50}
								placeholder="0991234567"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="new-client-address">Dirección</Label>
							<Input
								id="new-client-address"
								value={createForm.address}
								onChange={(e) =>
									setCreateForm({ ...createForm, address: e.target.value })
								}
								required
								maxLength={255}
								placeholder="Av. Siempre Viva 123"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="new-client-email">Correo Electrónico</Label>
							<Input
								id="new-client-email"
								type="email"
								value={createForm.email}
								onChange={(e) =>
									setCreateForm({ ...createForm, email: e.target.value })
								}
								required
								maxLength={255}
								placeholder="cliente@example.com"
							/>
						</div>
						<DialogFooter className="gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsCreateOpen(false)}
								disabled={createClientMutation.isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={createClientMutation.isPending}>
								{createClientMutation.isPending ? (
									<>
										<Loader2 className="size-3 mr-2 animate-spin" /> Creando
									</>
								) : (
									"Crear Cliente"
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};
