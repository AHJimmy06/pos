import { ClientRepository } from "../../domain/repositories/client.repository";
import { Client } from "../../domain/entities/client.entity";
import { apiClient } from "../api/api-client";
import { ClientMapper } from "../mappers/client.mapper";
import type { ClientResponseDto } from "../dto/api-response.dto";
import type { AxiosResponse } from "axios";

// Helper para extraer el payload de la respuesta del interceptor
// El interceptor puede devolver: response completo, { data: [], total }, o el payload directo
function extractPayload<T>(response: unknown): T {
	const res = response as AxiosResponse;
	const data = res.data;

	// Si tiene la estructura NestJS wrapper
	if (data && typeof data === "object" && "success" in data && "data" in data) {
		const inner = (data as { data: unknown }).data;
		// Si es paginado (tiene data y total)
		if (
			inner &&
			typeof inner === "object" &&
			"data" in inner &&
			"total" in inner
		) {
			return inner as unknown as T;
		}
		// Si es simple payload
		return inner as T;
	}

	// Si no tiene wrapper, retornar directo
	return data as T;
}

export class ApiClientRepository implements ClientRepository {
	async findAll(): Promise<Client[]> {
		const response = await apiClient.get<ClientResponseDto[]>("/clients");
		const payload = extractPayload<
			{ data: ClientResponseDto[]; total: number } | ClientResponseDto[]
		>(response);
		const data: ClientResponseDto[] = Array.isArray(payload)
			? payload
			: payload.data;
		return data.map(ClientMapper.toDomain);
	}

	async findById(id: number): Promise<Client | null> {
		const response = await apiClient.get<ClientResponseDto>(`/clients/${id}`);
		const data = extractPayload<ClientResponseDto | null>(response);
		return data ? ClientMapper.toDomain(data) : null;
	}

	async create(client: Omit<Client, "id">): Promise<Client> {
		const response = await apiClient.post<ClientResponseDto>(
			"/clients",
			client,
		);
		const data = extractPayload<ClientResponseDto>(response);
		return ClientMapper.toDomain(data);
	}

	async update(id: number, client: Partial<Client>): Promise<Client> {
		const response = await apiClient.put<ClientResponseDto>(
			`/clients/${id}`,
			client,
		);
		const data = extractPayload<ClientResponseDto>(response);
		return ClientMapper.toDomain(data);
	}

	async delete(id: number): Promise<void> {
		await apiClient.delete(`/clients/${id}`);
	}
}
