import {
	useQuery,
	useMutation,
	useQueryClient,
	keepPreviousData,
} from "@tanstack/react-query";
import { useApplication } from "../context/use-application";
import { apiClient } from "@/infrastructure/api/api-client";
import { Invoice } from "../../domain/entities/invoice.entity";

export const useTaxes = () => {
	const { repositories } = useApplication();
	const taxesQuery = useQuery({
		queryKey: ["taxes"],
		queryFn: () => repositories.taxRepository.findAll(),
	});

	// El apiClient puede devolver { data: [...], total } o un array directo
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const taxesData = taxesQuery.data as any;
	const taxes: any[] = taxesData?.data ?? taxesData ?? [];

	return {
		data: taxes,
		isLoading: taxesQuery.isLoading,
		isError: taxesQuery.isError,
	};
};

/**
 * Listing row shape returned by the backend's paginated invoices endpoint.
 * The serialised invoice entity exposes the snapshot fields directly
 * (subtotal/tax/total/status) even though the TS class declares them as
 * getters; the mapper preserves them on the wire.
 */
export interface InvoiceListItem {
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
}

export interface InvoicesFilters {
	page?: number;
	limit?: number;
	searchId?: number;
}

export interface UseInvoicesResult {
	invoices: InvoiceListItem[];
	total: number;
	totalPages: number;
	isLoading: boolean;
	isFetching: boolean;
	isError: boolean;
	error: unknown;
	createInvoice: (invoice: Invoice) => Promise<Invoice>;
	isCreating: boolean;
	cancelInvoice: (id: number, status: string) => Promise<void>;
	isCancelling: boolean;
}

export const useInvoices = (
	filters: InvoicesFilters = {},
): UseInvoicesResult => {
	const queryClient = useQueryClient();
	const { repositories } = useApplication();
	const { page = 1, limit = 10, searchId } = filters;

	const invoicesQuery = useQuery({
		queryKey: ["invoices", { page, limit, searchId }],
		queryFn: async () => {
			const result = await repositories.invoiceRepository.findAllPaginated(
				page,
				limit,
				searchId,
			);
			return result as unknown as { data: InvoiceListItem[]; total: number };
		},
		placeholderData: keepPreviousData,
	});

	const createInvoiceMutation = useMutation({
		mutationFn: (invoice: Invoice) =>
			repositories.invoiceRepository.create(invoice),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});

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
		invoices: (invoicesQuery.data?.data ?? []) as InvoiceListItem[],
		total: invoicesQuery.data?.total ?? 0,
		totalPages: Math.ceil((invoicesQuery.data?.total ?? 0) / limit),
		isLoading: invoicesQuery.isLoading,
		isFetching: invoicesQuery.isFetching,
		isError: invoicesQuery.isError,
		error: invoicesQuery.error,
		createInvoice: createInvoiceMutation.mutateAsync,
		isCreating: createInvoiceMutation.isPending,
		cancelInvoice: (id: number, status: string) =>
			cancelMutation.mutateAsync({ id, status }),
		isCancelling: cancelMutation.isPending,
	};
};
