import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { apiClient } from '../api/api-client';
import { ProductMapper } from '../mappers/product.mapper';
import type { ProductResponseDto } from '../dto/api-response.dto';

export class ApiProductRepository implements ProductRepository {
  async findAll(): Promise<Product[]> {
    const response = await apiClient.get<ProductResponseDto[]>('/products');
    const data: ProductResponseDto[] = (response as unknown as { data: ProductResponseDto[] }).data;
    return data.map(ProductMapper.toDomain);
  }

  async findById(id: number): Promise<Product | null> {
    const response = await apiClient.get<ProductResponseDto>(`/products/${id}`);
    const data: ProductResponseDto = (response as unknown as { data: ProductResponseDto }).data;
    return data ? ProductMapper.toDomain(data) : null;
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await apiClient.post<ProductResponseDto>('/products', product);
    const data: ProductResponseDto = (response as unknown as { data: ProductResponseDto }).data;
    return ProductMapper.toDomain(data);
  }

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<ProductResponseDto>(`/products/${id}`, product);
    const data: ProductResponseDto = (response as unknown as { data: ProductResponseDto }).data;
    return ProductMapper.toDomain(data);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }
}
