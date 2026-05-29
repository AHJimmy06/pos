import { TaxRepository } from "../../domain/repositories/tax.repository";
import { Tax } from "../../domain/entities/tax.entity";
import { apiClient } from "../api/api-client";
import { TaxMapper } from "../mappers/tax.mapper";
import type { TaxResponseDto } from "../dto/api-response.dto";
import type { AxiosResponse } from "axios";

// Helper para extraer el payload de la respuesta del interceptor
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

export class ApiTaxRepository implements TaxRepository {
	async findAll(): Promise<Tax[]> {
		const response = await apiClient.get<TaxResponseDto[]>("/taxes");
		const payload = extractPayload<
			{ data: TaxResponseDto[]; total: number } | TaxResponseDto[]
		>(response);
		const data: TaxResponseDto[] = Array.isArray(payload)
			? payload
			: payload.data;
		return data.map(TaxMapper.toDomain);
	}

	async findById(id: number): Promise<Tax | null> {
		const response = await apiClient.get<TaxResponseDto>(`/taxes/${id}`);
		const data = extractPayload<TaxResponseDto | null>(response);
		return data ? TaxMapper.toDomain(data) : null;
	}
}
