import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";

export interface Client {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	isActive: boolean;
	get fullName(): string;
}

export interface CreateClientDto {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	address?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
	isActive?: boolean;
}

interface PaginatedResponse<T> {
	data: T[];
	total: number;
}

export type SearchField = "all" | "id" | "name" | "email" | "phone";

interface UseClientsResult {
	clients: Client[];
	total: number;
	totalPages: number;
	limit: number;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	createClient: (data: CreateClientDto) => Promise<Client>;
	updateClient: (id: number, data: UpdateClientDto) => Promise<Client>;
	deleteClient: (id: number) => Promise<void>;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
}

export const useClients = (
	page = 1,
	limit = 15,
	search = "",
	searchField: SearchField = "all",
): UseClientsResult => {
	const queryClient = useQueryClient();

	const clientsQuery = useQuery({
		queryKey: ["clients", { page, limit, search, searchField }],
		queryFn: async (): Promise<PaginatedResponse<Client>> => {
			const params = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});
			if (search) {
				params.append("search", search);
				params.append("searchField", searchField);
			}
			const response = await apiClient.get<PaginatedResponse<Client>>(`/clients?${params}`);
			return response.data ?? { data: [], total: 0 };
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: CreateClientDto): Promise<Client> => {
			const response = await apiClient.post<Client>("/clients", data);
			if (!response.data) throw new Error("Error al crear cliente");
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: UpdateClientDto;
		}): Promise<Client> => {
			const response = await apiClient.put<Client>(`/clients/${id}`, data);
			if (!response.data) throw new Error("Error al actualizar cliente");
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number): Promise<void> => {
			await apiClient.delete(`/clients/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});

	return {
		clients: ((clientsQuery.data as PaginatedResponse<Client>)?.data ?? []).map(
			(c) => ({
				...c,
				get fullName() {
					return `${c.firstName} ${c.lastName}`;
				},
			}),
		),
		total: (clientsQuery.data as PaginatedResponse<Client>)?.total ?? 0,
		totalPages: Math.ceil(
			((clientsQuery.data as PaginatedResponse<Client>)?.total ?? 0) / limit,
		),
		limit,
		isLoading: clientsQuery.isLoading,
		isError: clientsQuery.isError,
		error: clientsQuery.error,
		createClient: createMutation.mutateAsync,
		updateClient: (id: number, data: UpdateClientDto) =>
			updateMutation.mutateAsync({ id, data }),
		deleteClient: deleteMutation.mutateAsync,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
};
