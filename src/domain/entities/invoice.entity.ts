import { Money } from '../value-objects/money.vo';

export class InvoiceDetail {
  public unitPrice: Money;

  constructor(
    public readonly productId: number,
    public readonly productName: string,
    public readonly quantity: number,
    unitPrice: number | Money,
    public readonly taxes: { taxId: number, rate: number }[] = []
  ) {
    this.unitPrice = unitPrice instanceof Money ? unitPrice : new Money(unitPrice);
  }

  get subtotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  get taxTotal(): Money {
    const rateSum = this.taxes.reduce((sum, tax) => sum + tax.rate, 0);
    return this.subtotal.multiply(rateSum / 100);
  }

  get total(): Money {
    return this.subtotal.add(this.taxTotal);
  }
}

export class Invoice {
  public details: InvoiceDetail[] = [];
  public transactionId?: string;
  public issueDate?: Date;

  constructor(
    public readonly clientId: number,
    public readonly id?: number
  ) {}

  addDetail(detail: InvoiceDetail) {
    this.details.push(detail);
  }

  get subtotal(): Money {
    return this.details.reduce((sum, d) => sum.add(d.subtotal), new Money(0));
  }

  get taxTotal(): Money {
    return this.details.reduce((sum, d) => sum.add(d.taxTotal), new Money(0));
  }

  get total(): Money {
    return this.subtotal.add(this.taxTotal);
  }
}
