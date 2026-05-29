import {
	useQuery,
	useMutation,
	useQueryClient,
	keepPreviousData,
} from "@tanstack/react-query";
import { useApplication } from "../context/use-application";
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

export interface InvoicesFilters {
	page?: number;
	limit?: number;
	searchId?: number;
}

export const useInvoices = (filters: InvoicesFilters = {}) => {
	const queryClient = useQueryClient();
	const { repositories } = useApplication();
	const { page = 1, limit = 10, searchId } = filters;

	const invoicesQuery = useQuery({
		queryKey: ["invoices", { page, limit, searchId }],
		queryFn: () =>
			repositories.invoiceRepository.findAllPaginated(page, limit, searchId),
		placeholderData: keepPreviousData,
	});

	const createInvoiceMutation = useMutation({
		mutationFn: (invoice: Invoice) =>
			repositories.invoiceRepository.create(invoice),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["products"] }); // Para reflejar el cambio de stock
		},
	});

	return {
		invoices: invoicesQuery.data?.data ?? [],
		total: invoicesQuery.data?.total ?? 0,
		totalPages: Math.ceil((invoicesQuery.data?.total ?? 0) / limit),
		isLoading: invoicesQuery.isLoading,
		isFetching: invoicesQuery.isFetching,
		createInvoice: createInvoiceMutation.mutateAsync,
		isCreating: createInvoiceMutation.isPending,
	};
};
