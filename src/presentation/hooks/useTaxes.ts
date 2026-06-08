import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";

export interface Tax {
	id: number;
	name: string;
	currentRate: number;
}

export interface CreateTaxDto {
	name: string;
	currentRate: number;
}

export interface UpdateTaxDto {
	name?: string;
	currentRate?: number;
}

interface PaginatedResponse<T> {
	data: T[];
	total: number;
}

interface UseTaxesResult {
	taxes: Tax[];
	total: number;
	totalPages: number;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	createTax: (data: CreateTaxDto) => Promise<Tax>;
	updateTax: (id: number, data: UpdateTaxDto) => Promise<Tax>;
	deleteTax: (id: number) => Promise<void>;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
}

export const useTaxes = (page = 1, limit = 15, search = ""): UseTaxesResult => {
	const queryClient = useQueryClient();

	const taxesQuery = useQuery({
		queryKey: ["taxes", { page, limit, search }],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});
			if (search) {
				params.append("search", search);
			}
			const response = await apiClient.get<PaginatedResponse<Tax>>(`/taxes?${params}`);
				// interceptor preserves NestJS wrapper in response.data → extract inner payload
				const wrapper = response.data as { data?: unknown };
				const inner = wrapper?.data;
				if (inner && typeof inner === "object" && "data" in inner) {
					return inner as PaginatedResponse<Tax>;
				}
				return { data: [], total: 0 };
		},
	});

	const result = taxesQuery.data;
	const taxes = result?.data ?? [];
	const total = result?.total ?? 0;

	const createMutation = useMutation({
		mutationFn: async (data: CreateTaxDto): Promise<Tax> => {
			const response = await apiClient.post<Tax>("/taxes", data);
			// interceptor preserves NestJS wrapper → extract inner payload
			const wrapper = response.data as { data?: unknown };
			const inner = wrapper?.data;
			if (!inner) throw new Error("Error al crear impuesto");
			return inner as Tax;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["taxes"] });
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: UpdateTaxDto;
		}): Promise<Tax> => {
			const response = await apiClient.put<Tax>(`/taxes/${id}`, data);
			// interceptor preserves NestJS wrapper → extract inner payload
			const wrapper = response.data as { data?: unknown };
			const inner = wrapper?.data;
			if (!inner) throw new Error("Error al actualizar impuesto");
			return inner as Tax;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["taxes"] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number): Promise<void> => {
			await apiClient.delete(`/taxes/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["taxes"] });
		},
	});

	return {
		taxes,
		total,
		totalPages: Math.ceil(total / limit),
		isLoading: taxesQuery.isLoading,
		isError: taxesQuery.isError,
		error: taxesQuery.error,
		createTax: createMutation.mutateAsync,
		updateTax: (id: number, data: UpdateTaxDto) =>
			updateMutation.mutateAsync({ id, data }),
		deleteTax: deleteMutation.mutateAsync,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
};
