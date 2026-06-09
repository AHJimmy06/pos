import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { InvoicePDF } from "./InvoicePDF";
import type { Client as DomainClient } from "@/domain/entities/client.entity";
import type { Invoice } from "@/domain/entities/invoice.entity";

interface InvoicePrintModalProps {
	invoice: Invoice;
	selectedClient: DomainClient;
	invoiceNumber: string;
	onClose: () => void;
}

/**
 * Modal reusable para visualizar e imprimir una factura.
 * Usado por CartSidebar (auto-print tras una venta) e InvoicesPage
 * (reimpresion desde el modal de detalles).
 *
 * El componente NO auto-imprime al montar: el consumidor decide si
 * disparar la impresion inmediatamente o esperar a que el usuario
 * haga click en el boton "Imprimir" (ver InvoicePrintModal.autoPrint).
 */
export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
	invoice,
	selectedClient,
	invoiceNumber,
	onClose,
}) => {
	const componentRef = useRef<HTMLDivElement>(null);
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Factura_${invoiceNumber}`,
	});

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
				<div className="flex items-center justify-between p-6 border-b border-border bg-card">
					<h2 className="font-black text-lg">Factura #{invoiceNumber}</h2>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={() => handlePrint()}>
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
						invoice={invoice}
						client={selectedClient}
						invoiceNumber={invoiceNumber}
					/>
				</div>
			</div>
		</div>
	);
};
