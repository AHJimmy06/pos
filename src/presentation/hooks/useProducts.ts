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

export type SearchField = "all" | "id" | "name" | "price" | "stock";

interface UseProductsResult {
	products: Product[];
	total: number;
	totalPages: number;
	limit: number;
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
	searchField: SearchField = "all",
): UseProductsResult => {
	const queryClient = useQueryClient();

	const productsQuery = useQuery({
		queryKey: ["products", { page, limit, search, searchField }],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});
			if (search) {
				params.append("search", search);
				params.append("searchField", searchField);
			}
			const response = await apiClient.get<PaginatedResponse<Product>>(`/products?${params}`);
				// interceptor preserves NestJS wrapper in response.data → extract inner payload
				const wrapper = response.data as { data?: unknown };
				const inner = wrapper?.data;
				if (inner && typeof inner === "object" && "data" in inner) {
					return inner as PaginatedResponse<Product>;
				}
				return { data: [], total: 0 };
		},
	});

	const result = productsQuery.data;
	const products = result?.data ?? [];
	const total = result?.total ?? 0;

	const createMutation = useMutation({
		mutationFn: async (data: CreateProductDto): Promise<Product> => {
			const response = await apiClient.post<Product>("/products", data);
			// interceptor preserves NestJS wrapper → extract inner payload
			const wrapper = response.data as { data?: unknown };
			const inner = wrapper?.data;
			if (!inner) throw new Error("Error al crear producto");
			return inner as Product;
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
			const response = await apiClient.put<Product>(`/products/${id}`, data);
			// interceptor preserves NestJS wrapper → extract inner payload
			const wrapper = response.data as { data?: unknown };
			const inner = wrapper?.data;
			if (!inner) throw new Error("Error al actualizar producto");
			return inner as Product;
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
		limit,
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
