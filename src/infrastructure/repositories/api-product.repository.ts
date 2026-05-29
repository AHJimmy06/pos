import { ProductRepository } from "../../domain/repositories/product.repository";
import { Product } from "../../domain/entities/product.entity";
import { apiClient } from "../api/api-client";
import { ProductMapper } from "../mappers/product.mapper";
import type { ProductResponseDto } from "../dto/api-response.dto";
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

export class ApiProductRepository implements ProductRepository {
	async findAll(): Promise<Product[]> {
		const response = await apiClient.get<ProductResponseDto[]>("/products");
		const payload = extractPayload<
			{ data: ProductResponseDto[]; total: number } | ProductResponseDto[]
		>(response);
		const data: ProductResponseDto[] = Array.isArray(payload)
			? payload
			: payload.data;
		return data.map(ProductMapper.toDomain);
	}

	async findById(id: number): Promise<Product | null> {
		const response = await apiClient.get<ProductResponseDto>(`/products/${id}`);
		const data = extractPayload<ProductResponseDto | null>(response);
		return data ? ProductMapper.toDomain(data) : null;
	}

	async create(product: Omit<Product, "id">): Promise<Product> {
		const response = await apiClient.post<ProductResponseDto>(
			"/products",
			product,
		);
		const data = extractPayload<ProductResponseDto>(response);
		return ProductMapper.toDomain(data);
	}

	async update(id: number, product: Partial<Product>): Promise<Product> {
		const response = await apiClient.put<ProductResponseDto>(
			`/products/${id}`,
			product,
		);
		const data = extractPayload<ProductResponseDto>(response);
		return ProductMapper.toDomain(data);
	}

	async delete(id: number): Promise<void> {
		await apiClient.delete(`/products/${id}`);
	}
}
