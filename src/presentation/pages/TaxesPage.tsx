import React, { useState } from "react";
import { useTaxes, type Tax, type CreateTaxDto } from "../hooks/useTaxes";
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
	Percent,
} from "lucide-react";

export const TaxesPage: React.FC = () => {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [currentPageInput, setCurrentPageInput] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingTax, setEditingTax] = useState<Tax | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);

	const {
		taxes,
		total,
		totalPages,
		isLoading,
		error,
		createTax,
		updateTax,
		deleteTax,
		isCreating,
		isUpdating,
		isDeleting,
	} = useTaxes(page, 15, search);

	const [formData, setFormData] = useState<CreateTaxDto>({
		name: "",
		currentRate: 0,
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

	const openCreateDialog = () => {
		setEditingTax(null);
		setFormData({ name: "", currentRate: 0 });
		setIsDialogOpen(true);
	};

	const openEditDialog = (tax: Tax) => {
		setEditingTax(tax);
		setFormData({ name: tax.name, currentRate: tax.currentRate });
		setIsDialogOpen(true);
	};

	const openDeleteDialog = (tax: Tax) => {
		setTaxToDelete(tax);
		setIsDeleteDialogOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (editingTax) {
				await updateTax(editingTax.id, formData);
			} else {
				await createTax(formData);
			}
			setIsDialogOpen(false);
		} catch (err) {
			console.error("Error:", err);
		}
	};

	const handleDelete = async () => {
		if (taxToDelete) {
			try {
				await deleteTax(taxToDelete.id);
				setIsDeleteDialogOpen(false);
				setTaxToDelete(null);
			} catch (err) {
				console.error("Error:", err);
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
		return (
			<div className="flex flex-col items-center justify-center h-[400px] text-destructive">
				<p className="font-bold">Error al cargar impuestos</p>
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
						<Percent className="size-5" />
					</div>
					<div>
						<h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
							Impuestos
						</h1>
						<p className="text-muted-foreground">
							Configura los impuestos de tus productos
						</p>
					</div>
				</div>
				<Button
					onClick={openCreateDialog}
					className="font-bold uppercase tracking-tight"
				>
					<Plus className="mr-2 size-4" /> Nuevo Impuesto
				</Button>
			</div>

			{/* Table Card */}
			<Card className="border-none shadow-sm">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
							Listado de Impuestos ({total})
						</CardTitle>
						<form onSubmit={handleSearch} className="flex gap-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									placeholder="Buscar por nombre..."
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
									<th className="px-6 py-4 font-black text-right">Tasa</th>
									<th className="px-6 py-4 font-black text-center">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/50">
								{taxes.map((tax) => (
									<tr key={tax.id} className="bg-transparent hover:bg-muted/20">
										<td className="px-6 py-4 font-medium text-muted-foreground">
											#{tax.id}
										</td>
										<td className="px-6 py-4 font-bold">{tax.name}</td>
										<td className="px-6 py-4 text-right">
											<Badge variant="outline" className="font-mono">
												{Number(tax.currentRate).toFixed(2)}%
											</Badge>
										</td>
										<td className="px-6 py-4 text-center">
											<div className="flex items-center justify-center gap-1">
												<Button
													variant="ghost"
													size="icon-sm"
													onClick={() => openEditDialog(tax)}
												>
													<Pencil className="size-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon-sm"
													onClick={() => openDeleteDialog(tax)}
													className="text-destructive hover:text-destructive"
												>
													<Trash2 className="size-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
								{taxes.length === 0 && (
									<tr>
										<td
											colSpan={4}
											className="px-6 py-10 text-center text-muted-foreground"
										>
											No hay impuestos registrados
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
								Pagina {page} de {totalPages} ({total} impuestos)
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
							{editingTax ? "Editar Impuesto" : "Nuevo Impuesto"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Nombre</label>
							<Input
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
								placeholder="IVA"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Tasa (%)</label>
							<Input
								type="number"
								step="0.01"
								min="0"
								max="100"
								value={formData.currentRate}
								onChange={(e) =>
									setFormData({
										...formData,
										currentRate: parseFloat(e.target.value) || 0,
									})
								}
								required
								placeholder="19.00"
							/>
							<p className="text-xs text-muted-foreground">
								Ejemplo: 19 para IVA, 5 para impuesto reducido
							</p>
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
								) : editingTax ? (
									"Actualizar"
								) : (
									"Crear"
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Eliminar Impuesto</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						Seguro que deseas eliminar <strong>{taxToDelete?.name}</strong> (
						{taxToDelete?.currentRate}%)?
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
