import React, { useRef, useState, useEffect } from "react";
import { InvoiceDetail ,Invoice } from '@/domain/entities/invoice.entity';
import { useQueryClient } from "@tanstack/react-query";
import { usePOSStore } from "../store/usePOSStore";
import { useInvoices } from "../hooks/usePOS";
import { useProducts } from "../hooks/useProducts";
import { useTaxes } from "../hooks/useTaxes";
import { useApplication } from "../context/use-application";

import {
	ShoppingCart,
	Trash2,
	Plus,
	Minus,
	CreditCard,
	FileText,
	ShoppingBasket,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { InvoicePDF } from "./InvoicePDF";
import { ClientSelectorModal } from "./ClientSelectorModal";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

interface CartSidebarProps {
	onSuccess?: () => void;
	onError?: (message: string) => void;
}

// PDF Modal que aparece automáticamente tras una venta exitosa
const InvoicePrintModal: React.FC<{
	invoice: ReturnType<typeof usePOSStore.getState>["currentInvoice"];
	selectedClient: ReturnType<typeof usePOSStore.getState>["selectedClient"];
	invoiceNumber: string;
	onClose: () => void;
}> = ({ invoice, selectedClient, invoiceNumber, onClose }) => {
	const componentRef = useRef<HTMLDivElement>(null);
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Factura_${invoiceNumber}`,
	});

	// Auto-print al montar
	useEffect(() => {
		handlePrint();
	}, [handlePrint]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
				<div className="flex items-center justify-between p-6 border-b border-border bg-card">
					<h2 className="font-black text-lg">Factura #{invoiceNumber}</h2>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={handlePrint}>
							Imprimir
						</Button>
						<Button variant="ghost" size="sm" onClick={onClose}>
							Cerrar
						</Button>
					</div>
				</div>
				<div className="p-8 bg-muted/30 flex justify-center">
					<InvoicePDF
						ref={componentRef}
						invoice={invoice!}
						client={selectedClient!}
						invoiceNumber={invoiceNumber}
					/>
				</div>
			</div>
		</div>
	);
};

// Helper mejorado para formatear valores Money o números
const formatMoney = (value: unknown): string => {
	if (value === null || value === undefined) return "$0";

	// Si es un objeto con propiedad 'value' (Money o similar)
	if (typeof value === "object") {
		const obj = value as Record<string, unknown>;

		// Verificar si tiene 'value' público
		if ("value" in obj && typeof obj.value === "number") {
			return new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 0,
			}).format(obj.value);
		}

		// Si tiene '_value' (Money usa _value internamente)
		if ("_value" in obj && typeof obj._value === "number") {
			return new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 0,
			}).format(obj._value as number);
		}

		return "$0";
	}

	if (typeof value === "number") {
		return new Intl.NumberFormat("es-CO", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
		}).format(value);
	}

	return "$0";
};

// Helper para extraer número de un valor Money o número
const extractNumber = (value: unknown): number => {
	if (typeof value === "number") return value;
	if (value === null || value === undefined) return 0;

	if (typeof value === "object") {
		const obj = value as Record<string, unknown>;
		if ("value" in obj && typeof obj.value === "number") return obj.value;
		if ("_value" in obj && typeof obj._value === "number") return obj._value as number;
	}

	return 0;
};

export const CartSidebar: React.FC<CartSidebarProps> = ({
	onSuccess,
	onError,
}) => {
	const queryClient = useQueryClient();
	const { currentInvoice, selectedClient, setInvoice, clear } = usePOSStore();
	const { useCases } = useApplication();
	const { invoices, isCreating } = useInvoices();
	const { products } = useProducts();
	const { taxes } = useTaxes(1, 100); // Obtener todos los impuestos
	const componentRef = useRef<HTMLDivElement>(null);

	// Estado para el modal de impresión tras venta exitosa
	const [printData, setPrintData] = useState<{
		invoice: typeof currentInvoice;
		client: typeof selectedClient;
		number: string;
	} | null>(null);

	const nextInvoiceNumber =
		invoices.length > 0
			? Math.max(...invoices.map((i: { id?: number }) => i.id || 0)) + 1
			: 1;

	const formattedInvoiceNumber = nextInvoiceNumber.toString().padStart(6, "0");

	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Factura_${formattedInvoiceNumber}`,
	});

	const handleUpdateQuantity = (
		productId: number,
		delta: number,
		name: string,
	) => {
		if (!currentInvoice) return;
		const product = products.find((p: { id: number }) => p.id === productId);
		// Adapt stock to domain format
		const stockValue =
			typeof product?.stock === "object" && product?.stock !== null
				? (product.stock as { value: number }).value
				: ((product?.stock as number) ?? 0);

		try {
			const updated = useCases.updateQuantity.execute(
				currentInvoice,
				productId,
				delta,
				stockValue,
				name,
			);
			setInvoice(updated as typeof currentInvoice);
		} catch (e: unknown) {
			const error = e as { message?: string };
			alert(error?.message || "Error desconocido");
		}
	};

	const handleRemoveItem = (productId: number) => {
		if (!currentInvoice) return;
		const updated = useCases.removeItem.execute(currentInvoice, productId);
		setInvoice(updated);
	};

	// Cambiar impuesto de un item
	const handleChangeTax = (productId: number, newTaxId: number) => {
		if (!currentInvoice) return;

		// Obtener el objeto de impuesto completo
		const selectedTax = taxes.find((t: any) => t.id === newTaxId);
		if (!selectedTax) return;

		// Transformar a formato que espera InvoiceDetail
		const transformedTaxes = [{
			taxId: selectedTax.id,
			rate: extractNumber(selectedTax.currentRate),
		}];

		// Actualizar los detalles CON recálculo
		const updatedDetails = currentInvoice.details.map((detail: InvoiceDetail) => {
			if (detail.productId === productId) {
				// Crear un nuevo InvoiceDetail con los nuevos impuestos
				const newDetail = new InvoiceDetail(
					detail.productId,
					detail.productName,
					detail.quantity,
					extractNumber(detail.unitPrice),
					transformedTaxes
				);

				return newDetail;
			}
			return detail;
		});

		// Crear una nueva instancia de Invoice con los detalles actualizados
		const updatedInvoice = new Invoice(
			currentInvoice.clientId,
			currentInvoice.id
		);
		
		// USDiar propiedades
		updatedInvoice.details = updatedDetails;
		if (currentInvoice.transactionId) {
			updatedInvoice.transactionId = currentInvoice.transactionId;
		}
		if (currentInvoice.issueDate) {
			updatedInvoice.issueDate = currentInvoice.issueDate;
		}

		setInvoice(updatedInvoice);
	};

	const handleFinalize = async () => {
		if (!currentInvoice) return;
		try {
			await useCases.finalizeInvoice.execute(currentInvoice);
			queryClient.invalidateQueries({ queryKey: ["products"] });
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			// Guardar datos para el modal de impresión antes de limpiar
			setPrintData({
				invoice: currentInvoice,
				client: selectedClient,
				number: formattedInvoiceNumber,
			});
			onSuccess?.();
			clear();
		} catch (e: unknown) {
			const error = e as { message?: string };
			onError?.("Error: " + (error?.message || "Error desconocido"));
		}
	};

	// Obtener valores formateados del invoice
	const invoiceSubtotal = currentInvoice?.subtotal;
	const invoiceTaxTotal = currentInvoice?.taxTotal;
	const invoiceTotal = currentInvoice?.total;

	return (
		<>
			<Card className="flex flex-col h-[calc(100vh-100px)] shadow-xl border-border/50 overflow-hidden">
				<div className="hidden">
					{currentInvoice && selectedClient && (
						<InvoicePDF
							ref={componentRef}
							invoice={currentInvoice}
							client={selectedClient}
							invoiceNumber={formattedInvoiceNumber}
						/>
					)}
				</div>

				<CardHeader className="bg-muted/30 pb-4">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-2">
							<div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
								<ShoppingCart className="size-4" />
							</div>
							<CardTitle className="text-lg font-black tracking-tight">
								Carrito
							</CardTitle>
						</div>
						<Badge variant="outline" className="font-mono font-bold">
							#{formattedInvoiceNumber}
							<span className="ml-2 text-muted-foreground font-normal">
								{new Date().toLocaleDateString("es-AR")}
							</span>
						</Badge>
					</div>

					{/* Cliente - usa modal en vez de dropdown */}
					<ClientSelectorModal />
				</CardHeader>

				<CardContent className="flex-1 p-0 overflow-hidden">
					<ScrollArea className="h-full">
						{!currentInvoice || currentInvoice.details.length === 0 ? (
							<EmptyState
								icon={<ShoppingBasket className="size-6" />}
								title="Esperando Items"
								description="Seleccioná un cliente y agregá productos"
								className="h-full min-h-[200px]"
							/>
						) : (
							<table className="w-full text-left">
								<thead className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
									<tr className="text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50">
										<th className="pl-5 py-3 font-black">Producto</th>
										<th className="px-2 py-3 text-center font-black">Cant.</th>
										<th className="px-2 py-3 text-right font-black">P.Unit</th>
										<th className="px-2 py-3 text-center font-black">IVA</th>
										<th className="pr-5 py-3 text-right font-black w-28">
											Total
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/50">
									{currentInvoice.details.map((item: InvoiceDetail) => {
										// Adapt product stock for comparison
										const product = products.find(
											(p: { id: number }) => p.id === item.productId,
										);
										const stockValue = product
											? typeof product.stock === "object" &&
												product.stock !== null
												? (product.stock as { value: number }).value
												: (product.stock as number)
											: 0;
										const isAtMaxStock = item.quantity >= stockValue;
										
										// Obtener el primer impuesto del item (si existe)
										const currentTaxId = item.taxes.length > 0 
											? item.taxes[0].taxId 
											: (taxes.length > 0 ? taxes[0].id : "");

										return (
											<tr
												key={item.productId}
												className="group hover:bg-muted/50 transition-colors"
											>
												<td className="pl-5 py-3">
													<p className="text-xs font-bold line-clamp-1">
														{item.productName}
													</p>
												</td>
												<td className="px-2 py-3">
													<div className="flex items-center justify-center border rounded-lg overflow-hidden h-7 scale-90 bg-background">
														<Button
															variant="ghost"
															size="icon-xs"
															onClick={() =>
																handleUpdateQuantity(
																	item.productId,
																	-1,
																	item.productName,
																)
															}
														>
															<Minus className="size-3" />
														</Button>
														<span className="text-xs font-black w-5 text-center">
															{item.quantity}
														</span>
														<Button
															variant="ghost"
															size="icon-xs"
															disabled={isAtMaxStock}
															onClick={() =>
																handleUpdateQuantity(
																	item.productId,
																	1,
																	item.productName,
																)
															}
														>
															<Plus className="size-3" />
														</Button>
													</div>
												</td>
												<td className="px-2 py-3 text-right">
													<span className="text-xs font-medium text-muted-foreground font-mono">
														{formatMoney(item.unitPrice)}
													</span>
												</td>
												<td className="px-2 py-3 text-center">
													<select
														value={String(currentTaxId)}
														onChange={(e) => {
															handleChangeTax(item.productId, parseInt(e.target.value));
														}}
														className="h-7 text-[10px] px-2 rounded border border-input bg-background hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
													>
														{taxes.map((tax: any) => (
															<option key={tax.id} value={String(tax.id)}>
																{extractNumber(tax.currentRate)}%
															</option>
														))}
													</select>
												</td>
												<td className="pr-5 py-3 text-right relative w-28">
													<span className="text-xs font-black font-mono group-hover:opacity-0 transition-opacity block">
														{formatMoney(item.total)}
													</span>
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() => handleRemoveItem(item.productId)}
														className="absolute right-4 top-1/2 -translate-y-1/2 text-destructive opacity-0 group-hover:opacity-100 transition-all"
													>
														<Trash2 className="size-4" />
													</Button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						)}
					</ScrollArea>
				</CardContent>

				<CardFooter className="flex-col p-6 bg-background border-t gap-4">
					<div className="w-full space-y-1.5">
						<div className="flex justify-between text-xs">
							<span className="text-muted-foreground uppercase tracking-tighter text-[9px] font-bold">
								Subtotal
							</span>
							<span className="font-bold font-mono">
								{formatMoney(invoiceSubtotal)}
							</span>
						</div>
						<div className="flex justify-between text-xs">
							<span className="text-muted-foreground uppercase tracking-tighter text-[9px] font-bold">
								IVA
							</span>
							<span className="font-bold font-mono">
								{formatMoney(invoiceTaxTotal)}
							</span>
						</div>
						<Separator className="my-2" />
						<div className="flex justify-between items-center">
							<div>
								<p className="text-[9px] font-black text-primary uppercase tracking-widest">
									Total
								</p>
								<h3 className="text-2xl font-black tracking-tighter font-mono">
									{formatMoney(invoiceTotal)}
								</h3>
							</div>
							{currentInvoice &&
								currentInvoice.details.length > 0 &&
								selectedClient && (
									<Button
										variant="outline"
										size="sm"
										onClick={handlePrint}
										className="gap-1.5 text-[10px] font-bold"
									>
										<FileText className="size-3.5" />
										PDF
									</Button>
								)}
						</div>
					</div>

					<Button
						className="w-full h-12 text-sm font-bold gap-2"
						disabled={
							!currentInvoice || currentInvoice.details.length === 0 || isCreating
						}
						onClick={handleFinalize}
					>
						{isCreating ? (
							<div className="size-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
						) : (
							<>
								<CreditCard className="size-4" />
								COBRAR
							</>
						)}
					</Button>
				</CardFooter>
			</Card>

			{/* Modal de impresión automática tras venta exitosa */}
			{printData && (
				<InvoicePrintModal
					invoice={printData.invoice}
					selectedClient={printData.client}
					invoiceNumber={printData.number}
					onClose={() => setPrintData(null)}
				/>
			)}
		</>
	);
};