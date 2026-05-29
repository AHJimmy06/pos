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
			return response as unknown as PaginatedResponse<Product>;
		},
	});

	const result = productsQuery.data as PaginatedResponse<Product> | undefined;
	const products = result?.data ?? [];
	const total = result?.total ?? 0;

	const createMutation = useMutation({
		mutationFn: async (data: CreateProductDto): Promise<Product> => {
			const response = await apiClient.post("/products", data);
			return response as unknown as Product;
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
			return response as unknown as Product;
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
