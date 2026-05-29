import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";

export interface InvoiceDetail {
	productId: number;
	productName: string;
	quantity: number;
	unitPriceSnapshot: number;
	subtotal: number;
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
			return response as unknown as PaginatedResponse<Invoice>;
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
