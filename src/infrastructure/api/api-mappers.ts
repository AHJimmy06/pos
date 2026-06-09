import { Product } from "@/domain/entities/product.entity";
import { Money } from "@/domain/value-objects/money.vo";
import { StockQuantity } from "@/domain/value-objects/stock-quantity.vo";

/**
 * Shape del producto que llega de la API (serializado a JSON).
 * El mapper lo convierte a la entidad de dominio `Product`.
 */
interface ApiProductShape {
	id: number;
	name: string;
	price: number | Money;
	stock: number | StockQuantity;
}

/**
 * Transforma datos planos de la API a entidades del dominio
 */
export function mapApiProductToEntity(data: unknown): Product {
	const p = data as ApiProductShape;
	return new Product(
		p.id,
		p.name,
		p.price instanceof Money ? p.price : new Money(p.price),
		p.stock instanceof StockQuantity ? p.stock : new StockQuantity(p.stock),
	);
}

export function mapApiProductsToEntities(data: unknown[]): Product[] {
	return data.map((item) => mapApiProductToEntity(item));
}
