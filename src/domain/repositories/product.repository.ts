import { Product } from '../entities/product.entity';

export abstract class ProductRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: number): Promise<Product | null>;
  abstract create(product: Omit<Product, 'id'>): Promise<Product>;
  abstract update(id: number, product: Partial<Product>): Promise<Product>;
  abstract delete(id: number): Promise<void>;
}
