import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";

export interface InvoiceDetail {
	productId: number;
	productName: string;
	quantity: number;
	unitPriceSnapshot: number;
	subtotal: number;
	taxRate: number;
	taxName: string;
}

export interface Invoice {
	id: number;
	clientId: number;
	userId?: number;
	issueDate: string;
	subtotalSnapshot: number;
	taxTotalSnapshot: number;
	totalSnapshot: number;
	transactionId?: string;
	status: "DRAFT" | "CONFIRMED" | "CANCELLED";
	paymentMethod: string;
	details: InvoiceDetail[];
}

interface RawInvoiceDetail {
	productId: number;
	productName: string;
	quantity: number;
	// Backend serializa campos privados con _
	_unitPriceSnapshot?: { value: number };
	unitPriceSnapshot?: number;
	subtotal?: number;
	detailTaxes?: { taxName: string; taxRate: number }[];
}

interface RawInvoice {
	id: number;
	clientId: number;
	userId?: number;
	issueDate: string;
	subtotalSnapshot: number;
	taxTotalSnapshot: number;
	totalSnapshot: number;
	transactionId?: string;
	status: "DRAFT" | "CONFIRMED" | "CANCELLED";
	paymentMethod: string;
	details: RawInvoiceDetail[];
}

function mapDetail(raw: RawInvoiceDetail): InvoiceDetail {
	const unitPrice = raw.unitPriceSnapshot ?? raw._unitPriceSnapshot?.value ?? 0;
	const subtotal = raw.subtotal ?? unitPrice * raw.quantity;
	const taxes = raw.detailTaxes ?? [];
	// Si no hay impuestos, asumimos 0% IVA
	const mainTax = taxes[0];
	return {
		productId: raw.productId,
		productName: raw.productName,
		quantity: raw.quantity,
		unitPriceSnapshot: unitPrice,
		subtotal,
		taxRate: mainTax?.taxRate ?? 0,
		taxName: mainTax?.taxName ?? "IVA",
	};
}

export interface CreateInvoiceDto {
	clientId: number;
	items: {
		productId: number;
		quantity: number;
	}[];
	status?: "DRAFT" | "CONFIRMED";
}

interface PaginatedResponse<T> {
	data: T[];
	total: number;
}

interface UseInvoicesResult {
	invoices: Invoice[];
	total: number;
	totalPages: number;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	cancelInvoice: (id: number, status: string) => Promise<void>;
	isCancelling: boolean;
}

export const useInvoices = (
	page = 1,
	limit = 15,
	searchId?: number,
): UseInvoicesResult => {
	const queryClient = useQueryClient();

	// Helper para extraer payload de respuestas NestJS
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function getPayload<T>(response: any): T | null {
		const data = response?.data;

		if (!data) return null;

		// Si tiene estructura NestJS wrapper { success, data: ... }
		if (data.success !== undefined && data.data !== undefined) {
			const inner = data.data;
			// Si es paginado
			if (
				inner &&
				typeof inner === "object" &&
				"data" in inner &&
				"total" in inner
			) {
				return inner as T;
			}
			// Si es simple
			return inner as T;
		}

		// Si no tiene wrapper
		return data as T;
	}

	const invoicesQuery = useQuery({
		queryKey: ["invoices", { page, limit, searchId }],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});
			if (searchId) {
				params.append("searchId", String(searchId));
			}
			const response = await apiClient.get(`/invoices?${params}`);
			const raw = getPayload<PaginatedResponse<RawInvoice>>(response);
			if (!raw) return { data: [], total: 0 };
			return {
				data: (raw.data ?? []).map((inv) => ({
					...inv,
					details: inv.details.map(mapDetail),
				})),
				total: raw.total ?? 0,
			} as PaginatedResponse<Invoice>;
		},
	});

	const result = invoicesQuery.data as PaginatedResponse<Invoice> | undefined;
	const invoices = result?.data ?? [];
	const total = result?.total ?? 0;

	const cancelMutation = useMutation({
		mutationFn: async ({
			id,
			status,
		}: {
			id: number;
			status: string;
		}): Promise<void> => {
			await apiClient.patch(`/invoices/${id}/status`, { status });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});

	return {
		invoices,
		total,
		totalPages: Math.ceil(total / limit),
		isLoading: invoicesQuery.isLoading,
		isError: invoicesQuery.isError,
		error: invoicesQuery.error,
		cancelInvoice: (id: number, status: string) =>
			cancelMutation.mutateAsync({ id, status }),
		isCancelling: cancelMutation.isPending,
	};
};
