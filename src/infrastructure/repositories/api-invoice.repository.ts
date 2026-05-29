import { InvoiceRepository } from "../../domain/repositories/invoice.repository";
import { Invoice } from "../../domain/entities/invoice.entity";
import { apiClient } from "../api/api-client";
import { InvoiceMapper } from "../mappers/invoice.mapper";
import type {
	InvoiceResponseDto,
	PaginatedResponse,
} from "../dto/api-response.dto";
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

export class ApiInvoiceRepository implements InvoiceRepository {
	async findAll(): Promise<Invoice[]> {
		const response = await apiClient.get<InvoiceResponseDto[]>("/invoices");
		const payload = extractPayload<
			{ data: InvoiceResponseDto[]; total: number } | InvoiceResponseDto[]
		>(response);
		const data: InvoiceResponseDto[] = Array.isArray(payload)
			? payload
			: payload.data;
		return data.map(InvoiceMapper.toDomain);
	}

	async findAllPaginated(
		page: number,
		limit: number,
		searchId?: number,
	): Promise<{ data: Invoice[]; total: number }> {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		if (searchId) {
			params.append("searchId", searchId.toString());
		}
		const response = await apiClient.get<PaginatedResponse<InvoiceResponseDto>>(
			`/invoices?${params.toString()}`,
		);
		const payload =
			extractPayload<PaginatedResponse<InvoiceResponseDto>>(response);
		return {
			data: payload.data.map(InvoiceMapper.toDomain),
			total: payload.total,
		};
	}

	async findById(id: number): Promise<Invoice | null> {
		const response = await apiClient.get<InvoiceResponseDto>(`/invoices/${id}`);
		const data = extractPayload<InvoiceResponseDto | null>(response);
		return data ? InvoiceMapper.toDomain(data) : null;
	}

	async create(invoice: Invoice): Promise<Invoice> {
		const persistenceData = InvoiceMapper.toPersistence(invoice);
		const response = await apiClient.post<InvoiceResponseDto>(
			"/invoices",
			persistenceData,
		);
		const data = extractPayload<InvoiceResponseDto>(response);
		return InvoiceMapper.toDomain(data);
	}
}
