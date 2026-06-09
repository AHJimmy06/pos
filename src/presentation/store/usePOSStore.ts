import { create } from "zustand";
import { Invoice } from "../../domain/entities/invoice.entity";
import type { Client } from "../hooks/useClients";

interface POSState {
	currentInvoice: Invoice | null;
	selectedClient: Client | null;
	// Acciones Pasivas: Solo actualizan el estado con lo que reciben
	setInvoice: (invoice: Invoice) => void;
	setSelectedClient: (client: Client) => void;
	clear: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
	currentInvoice: null,
	selectedClient: null,

	setInvoice: (invoice: Invoice) => set({ currentInvoice: invoice }),

	setSelectedClient: (client: Client) =>
		set({
			selectedClient: client,
			currentInvoice: new Invoice(client.id),
		}),

	clear: () => set({ currentInvoice: null, selectedClient: null }),
}));
