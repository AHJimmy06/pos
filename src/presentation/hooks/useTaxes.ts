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

// Helper para extraer payload de respuestas NestJS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPayload<T>(response: any): T | null {
	const data = response?.data;
	if (!data) return null;
	if (data.success !== undefined && data.data !== undefined) {
		const inner = data.data;
		if (
			inner &&
			typeof inner === "object" &&
			"data" in inner &&
			"total" in inner
		) {
			return inner as T;
		}
		return inner as T;
	}
	return data as T;
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
			const response = await apiClient.get(`/taxes?${params}`);
			const payload = getPayload<PaginatedResponse<Tax>>(response);
			return payload ?? { data: [], total: 0 };
		},
	});

	const result = taxesQuery.data as PaginatedResponse<Tax> | undefined;
	const taxes = result?.data ?? [];
	const total = result?.total ?? 0;

	const createMutation = useMutation({
		mutationFn: async (data: CreateTaxDto): Promise<Tax> => {
			const response = await apiClient.post("/taxes", data);
			const payload = getPayload<Tax>(response);
			if (!payload) throw new Error("Error al crear impuesto");
			return payload;
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
			const response = await apiClient.put(`/taxes/${id}`, data);
			const payload = getPayload<Tax>(response);
			if (!payload) throw new Error("Error al actualizar impuesto");
			return payload;
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
