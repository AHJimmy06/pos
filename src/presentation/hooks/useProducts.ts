import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";

export interface Product {
	id: number;
	name: string;
	price: number;
	stock: number;
	isActive: boolean;
}

export interface CreateProductDto {
	name: string;
	price: number;
	stock: number;
	taxIds?: number[];
}

export interface UpdateProductDto {
	name?: string;
	price?: number;
	stock?: number;
	isActive?: boolean;
	taxIds?: number[];
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

interface UseProductsResult {
	products: Product[];
	total: number;
	totalPages: number;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	createProduct: (data: CreateProductDto) => Promise<Product>;
	updateProduct: (id: number, data: UpdateProductDto) => Promise<Product>;
	deleteProduct: (id: number) => Promise<void>;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
}

export const useProducts = (
	page = 1,
	limit = 15,
	search = "",
): UseProductsResult => {
	const queryClient = useQueryClient();

	const productsQuery = useQuery({
		queryKey: ["products", { page, limit, search }],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});
			if (search) {
				params.append("search", search);
			}
			const response = await apiClient.get(`/products?${params}`);
			const payload = getPayload<PaginatedResponse<Product>>(response);
			return payload ?? { data: [], total: 0 };
		},
	});

	const result = productsQuery.data as PaginatedResponse<Product> | undefined;
	const products = result?.data ?? [];
	const total = result?.total ?? 0;

	const createMutation = useMutation({
		mutationFn: async (data: CreateProductDto): Promise<Product> => {
			const response = await apiClient.post("/products", data);
			const payload = getPayload<Product>(response);
			if (!payload) throw new Error("Error al crear producto");
			return payload;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: UpdateProductDto;
		}): Promise<Product> => {
			const response = await apiClient.put(`/products/${id}`, data);
			const payload = getPayload<Product>(response);
			if (!payload) throw new Error("Error al actualizar producto");
			return payload;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number): Promise<void> => {
			await apiClient.delete(`/products/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});

	return {
		products,
		total,
		totalPages: Math.ceil(total / limit),
		isLoading: productsQuery.isLoading,
		isError: productsQuery.isError,
		error: productsQuery.error,
		createProduct: createMutation.mutateAsync,
		updateProduct: (id: number, data: UpdateProductDto) =>
			updateMutation.mutateAsync({ id, data }),
		deleteProduct: deleteMutation.mutateAsync,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
};
