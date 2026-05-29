import React, { useState } from "react";
import { useClients, type Client } from "../hooks/useClients";
import { usePOSStore } from "../store/usePOSStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	User,
	Search,
	X,
	Loader2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

interface ClientSelectorModalProps {
	triggerClassName?: string;
}

export const ClientSelectorModal: React.FC<ClientSelectorModalProps> = ({
	triggerClassName,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [currentPageInput, setCurrentPageInput] = useState("");

	const { selectedClient, setSelectedClient, clear } = usePOSStore();
	const { clients, total, totalPages, isLoading } = useClients(
		page,
		15,
		search,
	);

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
		setSelectedClient(client as any);
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

	return (
		<>
			{/* Trigger - shown when no client selected */}
			{!selectedClient && (
				<button
					onClick={() => setIsOpen(true)}
					className={`w-full p-3 border-2 border-dashed border-muted rounded-xl text-center hover:border-primary/30 hover:bg-muted/20 transition-all ${triggerClassName || ""}`}
				>
					<p className="text-[10px] font-medium text-muted-foreground italic">
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
						<p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
							Cliente Activo
						</p>
						<p className="text-xs font-bold truncate">
							{selectedClient.fullName ||
								`${selectedClient.firstName} ${selectedClient.lastName}`}
						</p>
					</div>
					<button
						onClick={handleClear}
						className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
					>
						<X className="size-4" />
					</button>
					<button
						onClick={() => setIsOpen(true)}
						className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
					>
						<Search className="size-4" />
					</button>
				</div>
			)}

			{/* Modal */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => setIsOpen(false)}
					/>

					{/* Modal Content */}
					<div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden m-4">
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-border">
							<div className="flex items-center gap-3">
								<div className="bg-primary p-2 rounded-lg text-primary-foreground">
									<User className="size-5" />
								</div>
								<div>
									<h2 className="text-xl font-black tracking-tight">
										Seleccionar Cliente
									</h2>
									<p className="text-sm text-muted-foreground">
										Busca y selecciona un cliente ({total} disponibles)
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

						{/* Search */}
						<div className="p-4 border-b border-border bg-muted/20">
							<form onSubmit={handleSearch} className="flex gap-2">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
									<Input
										placeholder="Buscar por nombre o email..."
										value={searchInput}
										onChange={(e) => setSearchInput(e.target.value)}
										className="pl-10"
									/>
								</div>
								<Button type="submit" variant="secondary" size="sm">
									Buscar
								</Button>
								{search && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
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

						{/* Client List */}
						<div className="flex-1 overflow-y-auto p-4">
							{isLoading ? (
								<div className="flex items-center justify-center h-64">
									<Loader2 className="size-8 animate-spin text-primary" />
								</div>
							) : clients.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
									<User className="size-12 mb-4 opacity-30" />
									<p className="font-medium">No se encontraron clientes</p>
								</div>
							) : (
								<div className="space-y-2">
									{clients.map((client) => {
										const isSelected = selectedClient?.id === client.id;
										return (
											<button
												key={client.id}
												onClick={() => handleSelectClient(client)}
												className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
													isSelected
														? "border-primary bg-primary/5 ring-2 ring-primary/20"
														: "border-border hover:border-primary/30 hover:bg-muted/50"
												}`}
											>
												<div className="size-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0">
													#{client.id}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<p className="text-sm font-bold truncate">
															{client.firstName} {client.lastName}
														</p>
														{isSelected && (
															<Badge variant="default" className="text-[9px]">Seleccionado</Badge>
														)}
													</div>
													<p className="text-xs text-muted-foreground truncate">{client.email}</p>
												</div>
												<div className="text-right shrink-0">
													{client.phone && (
														<p className="text-xs text-muted-foreground">{client.phone}</p>
													)}
													<Badge
														variant={client.isActive ? "secondary" : "outline"}
														className="text-[9px] mt-1"
													>
														{client.isActive ? "Activo" : "Inactivo"}
													</Badge>
												</div>
											</button>
										);
									})}
								</div>
							)}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex flex-wrap items-center justify-between p-4 border-t border-border bg-muted/20 gap-4">
								<p className="text-sm text-muted-foreground">
									Pagina {page} de {totalPages} ({total} clientes)
								</p>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
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
													className="w-9"
												>
													{p}
												</Button>
											),
										)}
									</div>

									<Button
										variant="outline"
										size="sm"
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
											className="w-16 h-8 text-center"
										/>
										<Button type="submit" variant="secondary" size="sm">
											Ir
										</Button>
									</form>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};
