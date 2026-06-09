import React, { useState, useMemo } from "react";
import {
	useProducts,
	type SearchField,
	type Product,
} from "../hooks/useProducts";
import { useTaxes } from "../hooks/usePOS";
import type { Tax } from "../hooks/useTaxes";
import { usePOSStore } from "../store/usePOSStore";
import { useApplication } from "../context/use-application";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownSelector,
	type DropdownOption,
} from "@/components/ui/dropdown-selector";
import { Product as ProductEntity } from "../../domain/entities/product.entity";
import {
	Package,
	Search,
	X,
	Loader2,
	ChevronLeft,
	ChevronRight,
	Plus,
} from "lucide-react";

const cn = (...classes: (string | boolean | undefined)[]) =>
	classes.filter(Boolean).join(" ");

interface ProductSelectorModalProps {
	triggerClassName?: string;
}

const SEARCH_FIELD_LABELS: Record<string, string> = {
	all: "Todos",
	id: "ID",
	name: "Nombre",
	stock: "Stock",
};

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30] as const;

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
	triggerClassName,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState<number>(10);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [searchField, setSearchField] = useState<SearchField>("all");
	const [currentPageInput, setCurrentPageInput] = useState("");

	const { selectedClient, setInvoice } = usePOSStore();
	const { useCases } = useApplication();

	const { products, total, totalPages, isLoading } = useProducts(
		page,
		limit,
		search,
		searchField,
	);

	// Get taxes for adding to products
	const taxesData = useTaxes();
	// useTaxes() (de usePOS.ts) devuelve { data: Tax[]; isLoading; isError }.
	const taxes: Tax[] = taxesData.data;

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

	const handleAddProduct = (product: Product) => {
		// El stock ya viene normalizado como number por el interceptor de la API
		// (desempaqueta Value Objects { value: ... }).
		if (product.stock <= 0 || !selectedClient) return;

		const currentInvoice = usePOSStore.getState().currentInvoice;
		if (!currentInvoice) return;

		try {
			const productTaxes = (taxes || []).filter((t: { id: number }) =>
				product.taxIds?.includes(t.id),
			);

			// Rehidratar la entidad de dominio para que tenga sus métodos (canSell, etc)
			const productEntity = new ProductEntity(
				product.id,
				product.name,
				product.price,
				product.stock,
			);
			productEntity.taxIds = product.taxIds || [];

			const updatedInvoice = useCases.addItem.execute(
				currentInvoice,
				productEntity,
				1,
				productTaxes,
			);
			setInvoice(updatedInvoice);
			setIsOpen(false);
			setSearch("");
			setPage(1);
			setSearchInput("");
		} catch (e: unknown) {
			const error = e as { message?: string };
			alert(error?.message || "Error desconocido");
		}
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
			<button
				onClick={() => selectedClient && setIsOpen(true)}
				disabled={!selectedClient}
				className={cn(
					"w-full p-3 border-2 border-dashed rounded-xl text-center transition-all",
					!selectedClient
						? "opacity-60 cursor-not-allowed border-muted"
						: "border-muted hover:border-primary/30 hover:bg-muted/20",
					triggerClassName,
				)}
			>
				<p className="text-[10px] font-medium text-muted-foreground italic">
					{selectedClient
						? "Buscar y agregar productos"
						: "Primero seleccione un cliente"}
				</p>
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						onClick={() => setIsOpen(false)}
					/>

					<div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-border">
						<div className="flex items-center justify-between p-6 border-b border-border bg-background">
							<div className="flex items-center gap-3">
								<div className="bg-primary p-2 rounded-lg text-primary-foreground">
									<Package className="size-5" />
								</div>
								<div>
									<h2 className="text-xl font-black tracking-tight uppercase">
										Agregar Productos
									</h2>
									<p className="text-xs text-muted-foreground font-medium">
										Catálogo de productos ({total} disponibles)
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
												<th className="px-6 py-4 text-right">Precio</th>
												<th className="px-6 py-4 text-center">Stock</th>
												<th className="px-6 py-4 text-center">Acciones</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/50">
											{(products || []).map((product) => {
												const hasStock = (product.stock || 0) > 0;
												return (
													<tr
														key={product.id}
														className={cn(
															"bg-transparent hover:bg-muted/30 transition-colors",
															!hasStock && "opacity-60",
														)}
													>
														<td className="px-6 py-4">
															<p className="font-bold text-foreground">
																{product.name}
															</p>
														</td>
														<td className="px-6 py-4 text-right">
															<p className="font-mono font-bold text-primary">
																{formatCurrency(product.price)}
															</p>
														</td>
														<td className="px-6 py-4 text-center">
															<span
																className={cn(
																	"px-2 py-0.5 rounded text-[10px] font-black uppercase",
																	!hasStock
																		? "bg-destructive/10 text-destructive"
																		: (product.stock || 0) <= 5
																			? "bg-amber-500/10 text-amber-600"
																			: "bg-emerald-500/10 text-emerald-600",
																)}
															>
																{hasStock ? product.stock : "Agotado"}
															</span>
														</td>
														<td className="px-6 py-4 text-center">
															<Button
																size="sm"
																className="h-8 text-[10px] font-black uppercase tracking-tight"
																disabled={!hasStock}
																onClick={() => handleAddProduct(product)}
															>
																<Plus className="size-3 mr-1" />
																Agregar
															</Button>
														</td>
													</tr>
												);
											})}
											{(products || []).length === 0 && (
												<tr>
													<td
														colSpan={4}
														className="px-6 py-10 text-center text-muted-foreground italic font-medium"
													>
														No se encontraron productos
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							)}
						</div>

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
									Página {page} de {totalPages} ({total} items)
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
		</>
	);
};
