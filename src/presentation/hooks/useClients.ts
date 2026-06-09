import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/infrastructure/api/api-client";

export interface Client {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	cedula?: string | null;
	isActive: boolean;
	get fullName(): string;
}

export interface CreateClientDto {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	address?: string;
	cedula: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
	isActive?: boolean;
}

interface PaginatedResponse<T> {
	data: T[];
	total: number;
}

// Helper para extraer payload de respuestas NestJS
function getPayload<T>(response: unknown): T | null {
	const res = response as { data?: unknown } | null | undefined;
	const data = res?.data;

	if (!data) return null;

	// Si tiene estructura NestJS wrapper { success, data: ... }
	if (typeof data === "object" && data !== null) {
		const wrapper = data as { success?: unknown; data?: unknown };
		if (wrapper.success !== undefined && wrapper.data !== undefined) {
			const inner = wrapper.data;
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
	}

	// Si no tiene wrapper
	return data as T;
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
			const response = await apiClient.get(`/clients?${params}`);
			// Extraer el payload correctamente
			const payload = getPayload<PaginatedResponse<Client>>(response);

			// Validar que sea un objeto con estructura correcta
			if (
				payload &&
				typeof payload === "object" &&
				"data" in payload &&
				Array.isArray(payload.data)
			) {
				return payload;
			}

			// Si no es válido, retornar estructura por defecto
			return {
				data: [],
				total: 0,
			};
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: CreateClientDto): Promise<Client> => {
			const response = await apiClient.post("/clients", data);
			const payload = getPayload<Client>(response);
			if (!payload) throw new Error("Error al crear cliente");
			return payload;
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
			// El backend prohíbe explícitamente enviar 'cedula' en el update (property cedula should not exist)
			const { cedula: _, ...updateData } = data;
			const response = await apiClient.put(`/clients/${id}`, updateData);
			const payload = getPayload<Client>(response);
			if (!payload) throw new Error("Error al actualizar cliente");
			return payload;
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

	// Garantizar que siempre retornamos un array válido
	const clientsData = clientsQuery.data ?? { data: [], total: 0 };
	const clientsArray = Array.isArray(clientsData?.data) ? clientsData.data : [];

	return {
		clients: clientsArray.map((c) => ({
			...c,
			get fullName() {
				return `${c.firstName} ${c.lastName}`;
			},
		})),
		total: (clientsData?.total as number) ?? 0,
		totalPages: Math.ceil(((clientsData?.total as number) ?? 0) / limit),
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
