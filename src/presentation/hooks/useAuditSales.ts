import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";

export interface AuditDetailTax {
	taxId: number;
	taxName: string;
	rateSnapshot: number;
	calculatedAmountSnapshot: number;
}

export interface AuditInvoiceDetail {
	id: number;
	productId: number;
	productName: string;
	quantity: number;
	unitPriceSnapshot: number;
	subtotal: number;
	taxes: AuditDetailTax[];
}

export interface AuditClient {
	id: number;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	phone: string | null;
	address: string | null;
}

export interface AuditSeller {
	id: number;
	username: string;
	name: string;
	lastName: string;
	email: string;
}

export interface AuditInvoice {
	id: number;
	invoiceNumber: string;
	issueDate: string;
	status: string;
	paymentMethod: string;
	transactionId: string | null;
	subtotalSnapshot: number;
	taxTotalSnapshot: number;
	totalSnapshot: number;
	client: AuditClient | null;
	seller: AuditSeller | null;
	details: AuditInvoiceDetail[];
}

interface UseAuditSalesResult {
	invoice: AuditInvoice | null;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	searchByNumber: (invoiceNumber: string) => void;
	clearInvoice: () => void;
	downloadPdf: () => void;
	isDownloadingPdf: boolean;
}

export const useAuditSales = (): UseAuditSalesResult => {
	const [currentNumber, setCurrentNumber] = useState<string | null>(null);

	const query = useQuery({
		queryKey: ["audit-invoice", currentNumber],
		queryFn: async (): Promise<AuditInvoice | null> => {
			if (!currentNumber) return null;
			try {
				const response = await apiClient.get<AuditInvoice>(
					`/invoices/by-number/${encodeURIComponent(currentNumber)}`,
				);
				// interceptor preserves NestJS wrapper → extract inner payload
				const wrapper = response.data as { data?: unknown };
				const inner = wrapper?.data;
				return (inner ?? null) as AuditInvoice | null;
			} catch (error: any) {
				if (error.response?.status === 404) {
					return null;
				}
				throw error;
			}
		},
		enabled: !!currentNumber,
		retry: false,
	});

	const downloadMutation = useQuery({
		queryKey: ["audit-invoice-pdf", currentNumber],
		queryFn: async (): Promise<Blob> => {
			if (!currentNumber) throw new Error("No invoice number");
			const response = await apiClient.get(
				`/invoices/by-number/${encodeURIComponent(currentNumber)}/pdf`,
				{ responseType: "blob" },
			);
			return response.data;
		},
		enabled: false,
		retry: false,
	});

	const searchByNumber = (invoiceNumber: string) => {
		setCurrentNumber(invoiceNumber.trim());
	};

	const clearInvoice = () => {
		setCurrentNumber(null);
	};

	const downloadPdf = async () => {
		if (!currentNumber) return;

		try {
			const blob = await downloadMutation.refetch().then((r) => r.data as Blob);
			if (blob) {
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `factura-${currentNumber}.pdf`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}
		} catch (err) {
			console.error("Error downloading PDF:", err);
		}
	};

	return {
		invoice: query.data ?? null,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		searchByNumber,
		clearInvoice,
		downloadPdf,
		isDownloadingPdf: downloadMutation.isFetching,
	};
};
