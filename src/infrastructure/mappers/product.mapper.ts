import { Product } from '../../domain/entities/product.entity';
import type { ProductResponseDto } from '../dto/api-response.dto';

export class ProductMapper {
  static toDomain(raw: ProductResponseDto): Product {
    const product = new Product(
      raw.id,
      raw.name || '',
      Number(raw.price || 0),
      raw.stock ?? 0
    );
    // Include taxIds from the API response
    product.taxIds = raw.taxIds || [];
    return product;
  }

  static toPersistence(product: Product): Record<string, unknown> {
    return {
      name: product.name,
      price: product.price,
      stock: product.stock
    };
  }
}
