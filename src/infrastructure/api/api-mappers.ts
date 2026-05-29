import { Product } from "@/domain/entities/product.entity";
import { Money } from "@/domain/value-objects/money.vo";
import { StockQuantity } from "@/domain/value-objects/stock-quantity.vo";

/**
 * Transforma datos planos de la API a entidades del dominio
 */
export function mapApiProductToEntity(data: any): Product {
	return new Product(
		data.id,
		data.name,
		data.price instanceof Money ? data.price : new Money(data.price),
		data.stock instanceof StockQuantity
			? data.stock
			: new StockQuantity(data.stock),
	);
}

export function mapApiProductsToEntities(data: any[]): Product[] {
	return data.map(mapApiProductToEntity);
}
