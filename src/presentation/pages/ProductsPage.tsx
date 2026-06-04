import React, { useState } from "react";
import {
	useProducts,
	type Product,
	type CreateProductDto,
	type SearchField,
} from "../hooks/useProducts";
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
	Package,
} from "lucide-react";

const cn = (...classes: (string | boolean | undefined)[]) =>
	classes.filter(Boolean).join(" ");

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

// Opciones de cantidad de registros
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30] as const;

// Mapping de labels para búsqueda
const SEARCH_FIELD_LABELS: Record<string, string> = {
	all: "Buscar por todos los campos...",
	id: "Buscar por ID...",
	name: "Buscar por nombre...",
	stock: "Buscar por stock...",
};

export const ProductsPage: React.FC = () => {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(15);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [searchField, setSearchField] = useState<SearchField>("all");
	const [currentPageInput, setCurrentPageInput] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [productToDelete, setProductToDelete] = useState<Product | null>(null);

	const {
		products,
		total,
		totalPages,
		isLoading,
		error,
		createProduct,
		updateProduct,
		deleteProduct,
		isCreating,
		isUpdating,
		isDeleting,
	} = useProducts(page, limit, search, searchField);

	const [formData, setFormData] = useState<CreateProductDto>({
		name: "",
		price: 0,
		stock: 0,
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
		setPage(1); // Reset to page 1 when changing limit
	};

	const handleSearchFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSearchField(e.target.value as SearchField);
		setSearch("");
		setSearchInput("");
	};

	const openCreateDialog = () => {
		setEditingProduct(null);
		setFormData({
			name: "",
			price: 0,
			stock: 0,
		});
		setIsDialogOpen(true);
	};

	const openEditDialog = (product: Product) => {
		setEditingProduct(product);
		setFormData({
			name: product.name,
			price: product.price,
			stock: product.stock,
		});
		setIsDialogOpen(true);
	};

	const openDeleteDialog = (product: Product) => {
		setProductToDelete(product);
		setIsDeleteDialogOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (editingProduct) {
				await updateProduct(editingProduct.id, formData);
			} else {
				await createProduct(formData);
			}
			setIsDialogOpen(false);
		} catch (err) {
			console.error("Error:", err);
		}
	};

	const handleDelete = async () => {
		if (productToDelete) {
			try {
				await deleteProduct(productToDelete.id);
				setIsDeleteDialogOpen(false);
				setProductToDelete(null);
			} catch (err) {
				console.error("Error:", err);
			}
		}
	};

	// Generate visible page numbers (show up to 7 pages with ellipsis)
	const getVisiblePages = () => {
		const pages: (number | "...")[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);
			if (page > 3) pages.push("...");
			for (
				let i = Math.max(2, page - 1);
				i <= Math.min(totalPages - 1, page + 1);
				i++
			) {
				pages.push(i);
			}
			if (page < totalPages - 2) pages.push("...");
			pages.push(totalPages);
		}
		return pages;
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="bg-primary p-2 rounded-lg text-primary-foreground">
						<Package className="size-5" />
					</div>
					<div>
						<h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
							Productos
						</h1>
						<p className="text-muted-foreground">
							Administra tu inventario y precios
						</p>
					</div>
				</div>
				<Button
					onClick={openCreateDialog}
					className="font-bold uppercase tracking-tight"
				>
					<Plus className="mr-2 size-4" /> Nuevo Producto
				</Button>
			</div>

			{/* Table Card */}
			<Card className="border-none shadow-sm">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
							Listado de Productos ({total})
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
								<option value="stock">Stock</option>
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
					{isLoading ? (
						<div className="h-[400px] flex items-center justify-center">
							<Loader2 className="size-8 animate-spin text-primary" />
						</div>
					) : error ? (
						<div className="h-[400px] flex flex-col items-center justify-center text-destructive">
							<p className="font-bold">Error al cargar productos</p>
							<p className="text-sm">{(error as Error).message}</p>
						</div>
					) : (
						<>
							{/* Table */}
							<div className="relative overflow-x-auto rounded-xl border border-border/50">
								<table className="w-full text-sm text-left">
									<thead className="text-xs text-muted-foreground uppercase bg-muted/30">
										<tr>
											<th className="px-6 py-4 font-black">ID</th>
											<th className="px-6 py-4 font-black">Nombre</th>
											<th className="px-6 py-4 font-black text-right">
												Precio
											</th>
											<th className="px-6 py-4 font-black text-center">
												Stock
											</th>
											<th className="px-6 py-4 font-black text-center">
												Estado
											</th>
											<th className="px-6 py-4 font-black text-center">
												Acciones
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/50">
										{products.map((product) => (
											<tr
												key={product.id}
												className="bg-transparent hover:bg-muted/20 transition-colors"
											>
												<td className="px-6 py-4 font-medium text-muted-foreground">
													#{product.id}
												</td>
												<td className="px-6 py-4 font-bold text-foreground">
													{product.name}
												</td>
												<td className="px-6 py-4 text-right font-mono font-bold">
													{formatCurrency(product.price)}
												</td>
												<td className="px-6 py-4 text-center">
													<span
														className={cn(
															"px-2 py-1 rounded text-xs font-bold",
															product.stock <= 5
																? "bg-destructive/10 text-destructive"
																: "bg-emerald-500/10 text-emerald-600",
														)}
													>
														{product.stock}
													</span>
												</td>
												<td className="px-6 py-4 text-center">
													<Badge
														variant={product.isActive ? "default" : "secondary"}
													>
														{product.isActive ? "Activo" : "Inactivo"}
													</Badge>
												</td>
												<td className="px-6 py-4 text-center">
													<div className="flex items-center justify-center gap-1">
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => openEditDialog(product)}
														>
															<Pencil className="size-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => openDeleteDialog(product)}
															className="text-destructive hover:text-destructive"
														>
															<Trash2 className="size-4" />
														</Button>
													</div>
												</td>
											</tr>
										))}
										{products.length === 0 && (
											<tr>
												<td
													colSpan={6}
													className="px-6 py-10 text-center text-muted-foreground italic"
												>
													No hay productos registrados
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
										<span className="text-sm text-muted-foreground">
											Mostrar
										</span>
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
										Página {page} de {totalPages} ({total} productos)
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
											onClick={() =>
												setPage((p) => Math.min(totalPages, p + 1))
											}
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
						</>
					)}
				</CardContent>
			</Card>

			{/* Create/Edit Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingProduct ? "Editar Producto" : "Nuevo Producto"}
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
								placeholder="Nombre del producto"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Precio (USD)</label>
								<Input
									type="number"
									min={0}
									value={formData.price}
									onChange={(e) =>
										setFormData({
											...formData,
											price: parseFloat(e.target.value) || 0,
										})
									}
									required
									placeholder="0"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Stock</label>
								<Input
									type="number"
									min={0}
									value={formData.stock}
									onChange={(e) =>
										setFormData({
											...formData,
											stock: parseInt(e.target.value, 10) || 0,
										})
									}
									required
									placeholder="0"
								/>
							</div>
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
								) : editingProduct ? (
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
						<DialogTitle>¿Eliminar Producto?</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						¿Estás seguro de eliminar <strong>{productToDelete?.name}</strong>?
						Esta acción no se puede deshacer.
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
