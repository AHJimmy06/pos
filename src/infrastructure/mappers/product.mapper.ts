import { Product } from '../../domain/entities/product.entity';

export class ProductMapper {
  static toDomain(raw: any): Product {
    const product = new Product(
      raw.id,
      raw._name?.value || raw.name || '',
      Number(raw._price?.value || raw.price || 0),
      raw._stock?.value ?? raw.stock ?? 0
    );
    // Include taxIds from the API response
    product.taxIds = raw.taxIds || raw.productTaxes?.map((pt: any) => pt.taxId) || [];
    return product;
  }

  static toPersistence(product: Product): any {
    return {
      name: product.name,
      price: product.price.value,
      stock: product.stock.value
    };
  }
}
