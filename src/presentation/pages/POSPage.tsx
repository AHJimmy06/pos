import React, { useEffect } from "react";
import { ClientSelectorModal } from "../components/ClientSelectorModal";
import { ProductSelectorModal } from "../components/ProductSelectorModal";
import { CartSidebar } from "../components/CartSidebar";
import { usePOSStore } from "../store/usePOSStore";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Warehouse } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export const POSPage: React.FC = () => {
	const { toast, showToast, hideToast } = useToast();
	const clearCart = usePOSStore((s) => s.clear);

	// POS-specific keyboard shortcuts dispatched by useGlobalShortcuts.
	// Each one focuses the relevant input or surfaces a hint toast.
	// Final "Confirmar venta" (Ctrl+Enter) is WIP: the COBRAR button lives
	// inside CartSidebar and has no accessible id from this scope, so we
	// show a hint instead of triggering it programmatically.
	useEffect(() => {
		const findInputInSection = (heading: string): HTMLInputElement | null => {
			const cards = document.querySelectorAll(
				"h1, h2, h3, h4, [class*='CardTitle']",
			);
			for (const card of Array.from(cards)) {
				if (!(card instanceof HTMLElement)) continue;
				if (!card.textContent?.toLowerCase().includes(heading.toLowerCase()))
					continue;
				const root =
					card.closest("[class*='rounded-xl']") ?? card.parentElement;
				if (!root) continue;
				const input = root.querySelector(
					"input[type='text'], input:not([type])",
				);
				if (input instanceof HTMLInputElement) return input;
			}
			return null;
		};

		const onProductSearch = () => {
			const input = findInputInSection("Productos");
			if (input) {
				input.focus();
				showToast("Buscador de productos enfocado", "info");
			} else {
				showToast(
					"Hacé click en 'Seleccionar producto' para abrir el buscador",
					"info",
				);
			}
		};
		const onClientSearch = () => {
			const input = findInputInSection("Cliente");
			if (input) {
				input.focus();
				showToast("Buscador de clientes enfocado", "info");
			} else {
				showToast(
					"Hacé click en 'Seleccionar cliente' para abrir el buscador",
					"info",
				);
			}
		};
		const onConfirmSale = () => {
			// Trigger the actual COBRAR button inside CartSidebar programmatically.
			// The button has id="confirm-sale-button" and we respect its disabled
			// state to avoid firing while the invoice is empty or already submitting.
			const btn = document.getElementById(
				"confirm-sale-button",
			) as HTMLButtonElement | null;
			if (!btn) {
				showToast("Botón COBRAR no encontrado en el carrito", "info");
				return;
			}
			if (btn.disabled) {
				showToast(
					"El carrito está vacío o la venta ya se está procesando",
					"info",
				);
				return;
			}
			btn.click();
		};
		const onSaveForm = () => {
			showToast(
				"Ctrl+S: no hay formulario para guardar en esta pantalla",
				"info",
			);
		};
		const onEscapePressed = () => {
			// Esc clears the current cart (currentInvoice + selectedClient) via
			// the POS store. Only fires if there is something to clear, so the
			// toast is informative and we don't wipe state for no reason.
			const { currentInvoice, selectedClient } = usePOSStore.getState();
			if (!currentInvoice && !selectedClient) {
				showToast("El carrito ya está vacío", "info");
				return;
			}
			clearCart();
			showToast("Carrito limpiado", "success");
		};

		window.addEventListener("pos:open-product-search", onProductSearch);
		window.addEventListener("pos:open-client-search", onClientSearch);
		window.addEventListener("pos:confirm-sale", onConfirmSale);
		window.addEventListener("pos:save-form", onSaveForm);
		window.addEventListener("app:escape-pressed", onEscapePressed);
		return () => {
			window.removeEventListener("pos:open-product-search", onProductSearch);
			window.removeEventListener("pos:open-client-search", onClientSearch);
			window.removeEventListener("pos:confirm-sale", onConfirmSale);
			window.removeEventListener("pos:save-form", onSaveForm);
			window.removeEventListener("app:escape-pressed", onEscapePressed);
		};
	}, [showToast, clearCart]);

	return (
		<div className="min-h-screen bg-background">
			{/* Toast notification */}
			{toast && (
				<Toast message={toast.message} type={toast.type} onClose={hideToast} />
			)}

			{/* Page Header */}
			<div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
				<div className="container mx-auto px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="bg-primary p-2 rounded-lg text-primary-foreground">
							<Warehouse className="size-5" />
						</div>
						<div>
							<h1 className="text-xl font-black tracking-tight text-foreground">
								Punto de Venta
							</h1>
							<p className="text-xs text-muted-foreground">
								Sistema de facturación y gestión
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-6 py-6 space-y-6">
				{/* Row 1: Cliente y Productos */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="uppercase tracking-tight text-xs font-black text-muted-foreground">
								1. Cliente
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ClientSelectorModal />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="uppercase tracking-tight text-xs font-black text-muted-foreground">
								2. Productos
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ProductSelectorModal />
						</CardContent>
					</Card>
				</div>

				{/* Row 2: Carrito - Full Width */}
				<CartSidebar
					onSuccess={() => showToast("¡Venta realizada con éxito!", "success")}
					onError={(msg) => showToast(msg, "error")}
				/>
			</div>
		</div>
	);
};
