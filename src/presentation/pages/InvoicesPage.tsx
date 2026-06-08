import React, { useState } from "react";
import { useInvoices } from "../hooks/usePOS";
import { apiClient } from "@/infrastructure/api/api-client";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Loader2,
	Search,
	ChevronLeft,
	ChevronRight,
	FileText,
	Eye,
	XCircle,
} from "lucide-react";

type InvoiceStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

interface InvoiceDetailRow {
	productId: number;
	productName: string;
	quantity: number;
	unitPriceSnapshot: number;
	subtotal: number;
	taxRate: number;
	taxName: string;
}

interface InvoiceClientRow {
	id: number;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	phone: string | null;
	address: string | null;
}

interface InvoiceSellerRow {
	id: number;
	username: string;
	name: string;
	lastName: string;
	email: string;
}

interface InvoiceRow {
	id: number;
	issueDate: string;
	subtotalSnapshot: number;
	taxTotalSnapshot: number;
	totalSnapshot: number;
	status: InvoiceStatus;
	paymentMethod: string;
	transactionId?: string;
	client?: InvoiceClientRow | null;
	seller?: InvoiceSellerRow | null;
	details: InvoiceDetailRow[];
}

export const InvoicesPage: React.FC = () => {
	const [page, setPage] = useState(1);
	const [searchIdInput, setSearchIdInput] = useState("");
	const [searchId, setSearchId] = useState<number | undefined>(undefined);
	const [currentPageInput, setCurrentPageInput] = useState("");
	const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(
		null,
	);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">(
		"ALL",
	);

	const {
		invoices,
		total,
		totalPages,
		isLoading,
		isError,
		error,
		cancelInvoice,
		isCancelling,
	} = useInvoices({ page, limit: 15, searchId });

	const { user } = useAuth();
	const isAdmin = user?.role === "ADMINISTRATOR";

	// Filtrar facturas por estado
	const filteredInvoices =
		statusFilter === "ALL"
			? invoices
			: invoices.filter((inv) => inv.status === statusFilter);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const id = parseInt(searchIdInput, 10);
		setSearchId(isNaN(id) ? undefined : id);
		setPage(1);
	};

	const handleClearSearch = () => {
		setSearchIdInput("");
		setSearchId(undefined);
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

	const [isLoadingDetails, setIsLoadingDetails] = useState(false);

	const openDetails = async (invoice: { id: number }) => {
		setIsDetailsOpen(true);
		setIsLoadingDetails(true);

		try {
			const response = await apiClient.get<InvoiceRow>(
				`/invoices/${invoice.id}`,
			);
			// interceptor preserves NestJS wrapper → extract inner payload
			const wrapper = response.data as { data?: unknown };
			const inner = wrapper?.data;
			if (inner && typeof inner === "object") {
				setSelectedInvoice(inner as InvoiceRow);
			}
		} catch (err) {
			console.error("Error cargando detalles:", err);
		} finally {
			setIsLoadingDetails(false);
		}
	};

	const handleCancel = async (invoice: { id: number }) => {
		if (confirm(`Cancelar factura #${invoice.id}?`)) {
			try {
				await cancelInvoice(invoice.id, "CANCELLED");
			} catch (err) {
				console.error("Error cancelando factura:", err);
			}
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

	const getStatusBadge = (status: InvoiceStatus) => {
		switch (status) {
			case "DRAFT":
				return <Badge variant="secondary">Borrador</Badge>;
			case "CONFIRMED":
				return <Badge variant="default">Confirmada</Badge>;
			case "CANCELLED":
				return <Badge variant="destructive">Cancelada</Badge>;
			default:
				return <Badge>{status}</Badge>;
		}
	};

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString("es-AR", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[400px]">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center h-[400px] text-destructive">
				<p className="font-bold">Error al cargar facturas</p>
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
						<FileText className="size-5" />
					</div>
					<div>
						<h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
							Facturas
						</h1>
						<p className="text-muted-foreground">
							Historial de facturas generadas
						</p>
					</div>
				</div>
			</div>

			{/* Table Card */}
			<Card className="border-none shadow-sm">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
							Listado de Facturas ({total})
						</CardTitle>
						<div className="flex gap-2 items-center">
							{/* Filtro por estado */}
							<select
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value as InvoiceStatus | "ALL");
									setPage(1);
								}}
								className="h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
							>
								<option value="ALL">Todos los estados</option>
								<option value="CONFIRMED">Confirmadas</option>
								<option value="DRAFT">Borrador</option>
								<option value="CANCELLED">Canceladas</option>
							</select>

							<form onSubmit={handleSearch} className="flex gap-2">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
									<Input
										placeholder="Buscar por ID de factura..."
										value={searchIdInput}
										onChange={(e) => setSearchIdInput(e.target.value)}
										className="pl-10 w-64"
										type="number"
										min={1}
									/>
								</div>
								<Button type="submit" variant="secondary" size="sm">
									Buscar
								</Button>
								{searchId && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={handleClearSearch}
									>
										Limpiar
									</Button>
								)}
							</form>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Table */}
					<div className="relative overflow-x-auto rounded-xl border border-border/50 min-w-[900px]">
						<table className="w-full text-sm text-left">
							<thead className="text-xs text-muted-foreground uppercase bg-muted/30">
								<tr>
									<th className="px-6 py-4 font-black">ID</th>
									<th className="px-6 py-4 font-black">Fecha</th>
									<th className="px-6 py-4 font-black text-right">Subtotal</th>
									<th className="px-6 py-4 font-black text-right">IVA</th>
									<th className="px-6 py-4 font-black text-right">Total</th>
									<th className="px-6 py-4 font-black text-center">Estado</th>
									<th className="px-6 py-4 font-black text-center">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/50">
								{filteredInvoices.map((invoice) => (
									<tr
										key={invoice.id}
										className="bg-transparent hover:bg-muted/20"
									>
										<td className="px-6 py-4 font-medium text-muted-foreground">
											#{invoice.id}
										</td>
										<td className="px-6 py-4">
											{formatDate(invoice.issueDate)}
										</td>
										<td className="px-6 py-4 text-right">
											{formatCurrency(invoice.subtotalSnapshot)}
										</td>
										<td className="px-6 py-4 text-right">
											{formatCurrency(invoice.taxTotalSnapshot)}
										</td>
										<td className="px-6 py-4 text-right font-bold">
											{formatCurrency(invoice.totalSnapshot)}
										</td>
										<td className="px-6 py-4 text-center">
											{getStatusBadge(invoice.status)}
										</td>
										<td className="px-6 py-4 text-center">
											<div className="flex items-center justify-center gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => openDetails(invoice)}
													title="Ver detalles"
												>
													<Eye className="size-4" />
												</Button>
												{isAdmin && invoice.status === "CONFIRMED" && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleCancel(invoice)}
														disabled={isCancelling}
														className="text-destructive hover:text-destructive"
														title="Cancelar factura"
													>
														<XCircle className="size-4" />
													</Button>
												)}
											</div>
										</td>
									</tr>
								))}
								{filteredInvoices.length === 0 && (
									<tr>
										<td
											colSpan={7}
											className="px-6 py-10 text-center text-muted-foreground"
										>
											{statusFilter === "ALL"
												? "No hay facturas registradas"
												: "No hay facturas con el estado seleccionado"}
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
								Pagina {page} de {totalPages} ({total} facturas)
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
				</CardContent>
			</Card>

			{/* Invoice Details Dialog */}
			<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto w-auto max-w-[95vw]">
					<DialogHeader>
						<DialogTitle>
							{isLoadingDetails ? (
								<Loader2 className="size-4 animate-spin inline ml-2" />
							) : (
								<span>Factura #{selectedInvoice?.id}</span>
							)}
						</DialogTitle>
					</DialogHeader>

					{isLoadingDetails && (
						<div className="flex justify-center py-12">
							<Loader2 className="size-8 animate-spin text-primary" />
						</div>
					)}

					{!isLoadingDetails && selectedInvoice && (
						<div className="space-y-6">
							{/* Cliente y Vendedor */}
							<div className="grid grid-cols-2 gap-4">
								<div className="border border-border rounded-lg p-4">
									<p className="text-xs font-black uppercase text-muted-foreground mb-2">
										Cliente
									</p>
									{selectedInvoice.client ? (
										<div className="space-y-1">
											<p className="font-bold">
												{selectedInvoice.client.firstName}{" "}
												{selectedInvoice.client.lastName}
											</p>
											<p className="text-sm text-muted-foreground">
												{selectedInvoice.client.email}
											</p>
											<p className="text-sm text-muted-foreground">
												{selectedInvoice.client.phone}
											</p>
											<p className="text-sm text-muted-foreground">
												{selectedInvoice.client.address}
											</p>
										</div>
									) : (
										<p className="text-muted-foreground">Sin cliente</p>
									)}
								</div>
								<div className="border border-border rounded-lg p-4">
									<p className="text-xs font-black uppercase text-muted-foreground mb-2">
										Vendedor
									</p>
									{selectedInvoice.seller ? (
										<div className="space-y-1">
											<p className="font-bold">
												{selectedInvoice.seller.name}{" "}
												{selectedInvoice.seller.lastName}
											</p>
											<p className="text-sm text-muted-foreground">
												@{selectedInvoice.seller.username}
											</p>
											<p className="text-sm text-muted-foreground">
												{selectedInvoice.seller.email}
											</p>
										</div>
									) : (
										<p className="text-muted-foreground">Sin vendedor</p>
									)}
								</div>
							</div>

							{/* Header Info */}
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">Fecha</p>
									<p className="font-medium">
										{formatDate(selectedInvoice.issueDate)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Estado</p>
									<p className="mt-1">
										{getStatusBadge(selectedInvoice.status)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Metodo de pago</p>
									<p className="font-medium">{selectedInvoice.paymentMethod}</p>
								</div>
								{selectedInvoice.transactionId && (
									<div>
										<p className="text-muted-foreground">Transaccion</p>
										<p className="font-mono text-xs">
											{selectedInvoice.transactionId}
										</p>
									</div>
								)}
							</div>

							{/* Items Table */}
							<div>
								<h3 className="text-sm font-bold mb-2">Productos</h3>
								<div className="rounded-lg border border-border/50 overflow-x-auto">
									<table className="w-full text-sm min-w-[700px]">
										<thead className="bg-muted/30">
											<tr>
												<th className="px-6 py-3 text-left font-black text-xs whitespace-nowrap">
													Producto
												</th>
												<th className="px-6 py-3 text-right font-black text-xs">
													Cant.
												</th>
												<th className="px-6 py-3 text-right font-black text-xs">
													Precio Unit.
												</th>
												<th className="px-6 py-3 text-right font-black text-xs whitespace-nowrap">
													IVA{" "}
													{selectedInvoice.details[0]?.taxRate > 0
														? `(${selectedInvoice.details[0].taxRate}%)`
														: ""}
												</th>
												<th className="px-6 py-3 text-right font-black text-xs">
													Subtotal
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/50">
											{selectedInvoice.details?.map((detail, idx) => {
												const iva =
													detail.taxRate > 0
														? (detail.subtotal * detail.taxRate) /
															(100 + detail.taxRate)
														: 0;
												return (
													<tr key={idx}>
														<td className="px-6 py-4 whitespace-nowrap">
															{detail.productName}
														</td>
														<td className="px-6 py-4 text-right whitespace-nowrap">
															{detail.quantity}
														</td>
														<td className="px-6 py-4 text-right whitespace-nowrap font-mono text-xs">
															{formatCurrency(detail.unitPriceSnapshot)}
														</td>
														<td className="px-6 py-4 text-right whitespace-nowrap text-muted-foreground">
															{detail.taxRate > 0
																? `${formatCurrency(iva)} (${detail.taxRate}%)`
																: "-"}
														</td>
														<td className="px-6 py-4 text-right whitespace-nowrap font-medium font-mono text-xs">
															{formatCurrency(detail.subtotal)}
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>

							{/* Totals */}
							<div className="space-y-2 border-t pt-4">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Subtotal</span>
									<span className="font-mono">
										{formatCurrency(selectedInvoice.subtotalSnapshot)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">IVA</span>
									<span className="font-mono">
										{formatCurrency(selectedInvoice.taxTotalSnapshot)}
									</span>
								</div>
								<div className="flex justify-between text-lg font-black border-t pt-2">
									<span>Total</span>
									<span className="font-mono">
										{formatCurrency(selectedInvoice.totalSnapshot)}
									</span>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};
