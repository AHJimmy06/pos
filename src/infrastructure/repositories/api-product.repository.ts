import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { apiClient } from '../api/api-client';
import { ProductMapper } from '../mappers/product.mapper';

export class ApiProductRepository implements ProductRepository {
  async findAll(): Promise<Product[]> {
    const data: any[] = await apiClient.get('/products');
    return data.map(ProductMapper.toDomain);
  }

  async findById(id: number): Promise<Product | null> {
    const data = await apiClient.get(`/products/${id}`);
    return data ? ProductMapper.toDomain(data) : null;
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const data = await apiClient.post('/products', product);
    return ProductMapper.toDomain(data);
  }

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const data = await apiClient.put(`/products/${id}`, product);
    return ProductMapper.toDomain(data);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }
}
