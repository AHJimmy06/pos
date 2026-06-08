import React, { useState } from "react";
import { useAuditSales } from "../hooks/useAuditSales";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
	Search, 
	FileText, 
	Download, 
	XCircle,
	Loader2,
	User,
	Package,
} from "lucide-react";

export const AuditSalesPage: React.FC = () => {
	const [searchInput, setSearchInput] = useState("");
	const {
		invoice,
		isLoading,
		isError,
		error,
		searchByNumber,
		clearInvoice,
		downloadPdf,
		isDownloadingPdf,
	} = useAuditSales();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchInput.trim()) {
			searchByNumber(searchInput.trim());
		}
	};

	const handleClear = () => {
		setSearchInput("");
		clearInvoice();
	};

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("es-AR", {
			style: "currency",
			currency: "ARS",
		}).format(value);

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString("es-CO", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	const getStatusBadge = (status: string) => {
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

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="bg-primary p-2 rounded-lg text-primary-foreground">
					<Search className="size-5" />
				</div>
				<div>
					<h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
						Auditoría de Ventas
					</h1>
					<p className="text-muted-foreground">
						Reconstruir y visualizar facturas por número de venta
					</p>
				</div>
			</div>

			{/* Search Card */}
			<Card className="border-none shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
						Buscar por Número de Factura
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSearch} className="flex gap-3">
						<div className="relative flex-1 max-w-md">
							<FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Ej: 001-001-0000001"
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Button type="submit" disabled={isLoading || !searchInput.trim()}>
							{isLoading ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Search className="size-4" />
							)}
							<span className="ml-2">Buscar</span>
						</Button>
						{(searchInput || invoice) && (
							<Button type="button" variant="ghost" onClick={handleClear}>
								<XCircle className="size-4" />
								<span className="ml-2">Limpiar</span>
							</Button>
						)}
					</form>
				</CardContent>
			</Card>

			{/* Error State */}
			{isError && (
				<Card className="border-destructive/50 bg-destructive/5">
					<CardContent className="pt-6">
						<div className="flex items-center gap-3 text-destructive">
							<XCircle className="size-5" />
							<p className="font-medium">
								Error al buscar factura: {(error as Error).message}
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* No Results */}
			{!isLoading && !invoice && searchInput && !isError && (
				<Card className="border-none shadow-sm">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
							<FileText className="size-12 mb-4 opacity-50" />
							<p className="font-medium">No se encontró la factura</p>
							<p className="text-sm mt-1">
								Verifica el número de factura e intenta nuevamente
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Invoice Reconstruction */}
			{invoice && (
				<Card className="border-none shadow-sm">
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
								Reconstrucción de Factura
							</CardTitle>
							<Button
								variant="outline"
								size="sm"
								onClick={downloadPdf}
								disabled={isDownloadingPdf}
							>
								{isDownloadingPdf ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Download className="size-4" />
								)}
								<span className="ml-2">Descargar PDF</span>
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Invoice Header Info */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="bg-muted/30 p-4 rounded-lg">
								<p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
									Número de Factura
								</p>
								<p className="font-mono font-bold text-lg">
									{invoice.invoiceNumber}
								</p>
							</div>
							<div className="bg-muted/30 p-4 rounded-lg">
								<p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
									Fecha de Emisión
								</p>
								<p className="font-medium">{formatDate(invoice.issueDate)}</p>
							</div>
							<div className="bg-muted/30 p-4 rounded-lg">
								<p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
									Estado
								</p>
								<div className="mt-1">{getStatusBadge(invoice.status)}</div>
							</div>
							<div className="bg-muted/30 p-4 rounded-lg">
								<p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
									Método de Pago
								</p>
								<p className="font-medium">{invoice.paymentMethod}</p>
							</div>
						</div>

						{/* Client and Seller */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="border border-border rounded-lg p-4">
								<div className="flex items-center gap-2 mb-3">
									<User className="size-4 text-muted-foreground" />
									<p className="text-xs font-black uppercase text-muted-foreground">
										Datos del Cliente
									</p>
								</div>
								{invoice.client ? (
									<div className="space-y-1">
										<p className="font-bold text-lg">
											{invoice.client.firstName} {invoice.client.lastName}
										</p>
										<p className="text-sm text-muted-foreground">
											{invoice.client.email}
										</p>
										<p className="text-sm text-muted-foreground">
											{invoice.client.phone}
										</p>
										<p className="text-sm text-muted-foreground">
											{invoice.client.address}
										</p>
									</div>
								) : (
									<p className="text-muted-foreground">Sin cliente</p>
								)}
							</div>
							<div className="border border-border rounded-lg p-4">
								<div className="flex items-center gap-2 mb-3">
									<User className="size-4 text-muted-foreground" />
									<p className="text-xs font-black uppercase text-muted-foreground">
										Datos del Vendedor
									</p>
								</div>
								{invoice.seller ? (
									<div className="space-y-1">
										<p className="font-bold text-lg">
											{invoice.seller.name} {invoice.seller.lastName}
										</p>
										<p className="text-sm text-muted-foreground">
											{invoice.seller.username}
										</p>
										<p className="text-sm text-muted-foreground">
											{invoice.seller.email}
										</p>
									</div>
								) : (
									<p className="text-muted-foreground">Sin vendedor</p>
								)}
							</div>
						</div>

						{/* Products Table */}
						<div>
							<div className="flex items-center gap-2 mb-3">
								<Package className="size-4 text-muted-foreground" />
								<p className="text-xs font-black uppercase text-muted-foreground">
									Productos
								</p>
							</div>
							<div className="rounded-lg border border-border overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-muted/30">
										<tr>
											<th className="px-6 py-3 text-left font-black text-xs">
												Producto
											</th>
											<th className="px-6 py-3 text-center font-black text-xs">
												Cant.
											</th>
											<th className="px-6 py-3 text-right font-black text-xs">
												Precio Unit.
											</th>
											<th className="px-6 py-3 text-right font-black text-xs">
												IVA
											</th>
											<th className="px-6 py-3 text-right font-black text-xs">
												Subtotal
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{invoice.details.map((detail, idx) => (
											<tr key={idx}>
												<td className="px-6 py-4 font-medium">
													{detail.productName}
												</td>
												<td className="px-6 py-4 text-center">
													{detail.quantity}
												</td>
												<td className="px-6 py-4 text-right font-mono text-xs">
													{formatCurrency(detail.unitPriceSnapshot)}
												</td>
												<td className="px-6 py-4 text-right text-muted-foreground text-xs">
													{detail.taxes.length > 0
														? detail.taxes.map(
																(t) =>
																	`${t.taxName} ${t.rateSnapshot}%`,
														  ).join(", ")
														: "-"}
												</td>
												<td className="px-6 py-4 text-right font-medium font-mono text-xs">
													{formatCurrency(detail.subtotal)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Totals */}
						<div className="flex justify-end border-t pt-4">
							<div className="w-72 space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Subtotal:</span>
									<span className="font-mono">
										{formatCurrency(invoice.subtotalSnapshot)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">IVA Total:</span>
									<span className="font-mono">
										{formatCurrency(invoice.taxTotalSnapshot)}
									</span>
								</div>
								<div className="flex justify-between text-xl font-black border-t pt-3">
									<span>TOTAL:</span>
									<span className="font-mono">
										{formatCurrency(invoice.totalSnapshot)}
									</span>
								</div>
							</div>
						</div>

						{/* Transaction ID */}
						{invoice.transactionId && (
							<div className="bg-muted/30 p-3 rounded-lg">
								<p className="text-[10px] font-black uppercase text-muted-foreground">
									ID de Transacción
								</p>
								<p className="font-mono text-sm">{invoice.transactionId}</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};