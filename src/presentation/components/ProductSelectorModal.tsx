import React, { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useTaxes } from "../hooks/usePOS";
import { usePOSStore } from "../store/usePOSStore";
import { useApplication } from "../context/use-application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Package,
	Search,
	X,
	Loader2,
	ChevronLeft,
	ChevronRight,
	Plus,
} from "lucide-react";

interface ProductSelectorModalProps {
	triggerClassName?: string;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
	triggerClassName,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [currentPageInput, setCurrentPageInput] = useState("");

	const { selectedClient, setInvoice } = usePOSStore();
	const { useCases } = useApplication();

	const { products, total, totalPages, isLoading } = useProducts(
		page,
		15,
		search,
	);

	// Get taxes for adding to products
	const taxesData = useTaxes();
	const taxes =
		(taxesData as any)?.taxes || (taxesData as any)?.data || taxesData || [];

	// Adapt products - keep as plain numbers for domain to wrap
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const adaptedProducts: any[] = (products || []).map((p) => {
		const stockValue =
			typeof p.stock === "object" && "value" in p.stock
				? (p.stock as { value: number }).value
				: (p.stock as number);
		const priceValue =
			typeof p.price === "object" && "value" in p.price
				? (p.price as { value: number }).value
				: (p.price as number);
		return {
			...p,
			// Pass as plain numbers - domain will wrap in Money/StockQuantity
			stock: stockValue,
			price: priceValue,
			hasStock: stockValue > 0,
			canSell: (quantity: number) => stockValue >= quantity && p.isActive,
		};
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

	const handleAddProduct = (product: (typeof adaptedProducts)[0]) => {
		if (!product.hasStock || !selectedClient) return;

		// Get current invoice from store
		const currentInvoice = usePOSStore.getState().currentInvoice;
		if (!currentInvoice) return;

		try {
			// Filter taxes for this product
			const productTaxes = (taxes || []).filter((t: { id: number }) =>
				(product as any).taxIds?.includes(t.id),
			);

			const updatedInvoice = useCases.addItem.execute(
				currentInvoice,
				product as any,
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

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("es-CO", {
			style: "currency",
			currency: "COP",
			minimumFractionDigits: 0,
		}).format(value);

	return (
		<>
			{/* Trigger */}
			<button
				onClick={() => selectedClient && setIsOpen(true)}
				disabled={!selectedClient}
				className={`w-full p-3 border-2 border-dashed rounded-xl text-center transition-all ${
					!selectedClient
						? "opacity-60 cursor-not-allowed border-muted"
						: "border-muted hover:border-primary/30 hover:bg-muted/20"
				} ${triggerClassName || ""}`}
			>
				<p className="text-[10px] font-medium text-muted-foreground italic">
					{selectedClient
						? "Buscar y agregar productos"
						: "Primero seleccione un cliente"}
				</p>
			</button>

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
									<Package className="size-5" />
								</div>
								<div>
									<h2 className="text-xl font-black tracking-tight">
										Agregar Productos
									</h2>
									<p className="text-sm text-muted-foreground">
										Busca y selecciona productos ({total} disponibles)
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
										placeholder="Buscar por nombre o ID..."
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

						{/* Product List */}
						<div className="flex-1 overflow-y-auto p-4">
							{isLoading ? (
								<div className="flex items-center justify-center h-64">
									<Loader2 className="size-8 animate-spin text-primary" />
								</div>
							) : adaptedProducts.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
									<Package className="size-12 mb-4 opacity-30" />
									<p className="font-medium">No se encontraron productos</p>
								</div>
							) : (
								<div className="space-y-2">
									{adaptedProducts.map((product) => (
										<div
											key={product.id}
											className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
												!product.hasStock
													? "border-border opacity-50"
													: "border-border hover:border-primary/30 hover:bg-muted/50"
											}`}
										>
											<div className="size-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0">
												#{product.id}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<p className="text-sm font-bold truncate">
														{product.name}
													</p>
													{!product.hasStock && (
														<Badge variant="destructive" className="text-[9px]">
															Agotado
														</Badge>
													)}
												</div>
												<p className="text-xs text-muted-foreground">
													Stock: {product.stock} unidades
												</p>
											</div>
											<div className="text-right shrink-0">
												<p className="text-sm font-bold text-primary">
													{formatCurrency(product.price)}
												</p>
												{product.hasStock && (
													<Button
														size="sm"
														className="mt-1 h-7 text-xs"
														onClick={() => handleAddProduct(product)}
													>
														<Plus className="size-3 mr-1" />
														Agregar
													</Button>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex flex-wrap items-center justify-between p-4 border-t border-border bg-muted/20 gap-4">
								<p className="text-sm text-muted-foreground">
									Pagina {page} de {totalPages} ({total} productos)
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
