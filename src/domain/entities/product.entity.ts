import { Money } from '../value-objects/money.vo';
import { StockQuantity } from '../value-objects/stock-quantity.vo';

export class Product {
  public price: Money;
  public stock: StockQuantity;
  public taxIds: number[] = [];

  constructor(
    public readonly id: number,
    public name: string,
    price: number | Money,
    stock: number | StockQuantity
  ) {
    this.price = price instanceof Money ? price : new Money(price);
    this.stock = stock instanceof StockQuantity ? stock : new StockQuantity(stock);
  }

  get hasStock(): boolean {
    return this.stock.value > 0;
  }

  canSell(quantity: number): boolean {
    return this.stock.hasEnough(quantity);
  }
}
