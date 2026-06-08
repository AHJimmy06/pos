import { Money } from "../value-objects/money.vo";

export class InvoiceDetail {
	public unitPrice: Money;

	constructor(
		public readonly productId: number,
		public readonly productName: string,
		public readonly quantity: number,
		unitPrice: number | Money,
		public readonly taxes: { taxId: number; rate: number }[] = [],
	) {
		this.unitPrice =
			unitPrice instanceof Money ? unitPrice : new Money(unitPrice);
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

	// Snapshot fields (mapped from DTO or calculated from details)
	private _subtotalSnapshot?: number | null;
	private _taxTotalSnapshot?: number | null;
	public status?: string;
	public paymentMethod?: string;
	public userId?: number;
	public clientNameSnapshot?: string;
	public clientEmailSnapshot?: string;
	public sellerNameSnapshot?: string;

	constructor(
		public readonly clientId: number,
		public readonly id?: number,
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

	// Snapshot getters that fallback to calculation from details
	get subtotalSnapshot(): number {
		const value = this._subtotalSnapshot;
		if (value !== null && value !== undefined) {
			return value;
		}
		// Fallback: calculate from details (each detail.subtotal is in the same unit as stored)
		return this.details.reduce((sum, d) => sum + d.subtotal.value, 0);
	}

	get taxTotalSnapshot(): number {
		const value = this._taxTotalSnapshot;
		if (value !== null && value !== undefined) {
			return value;
		}
		return this.details.reduce((sum, d) => sum + d.taxTotal.value, 0);
	}

	get totalSnapshot(): number {
		const subtotalValue = this._subtotalSnapshot;
		const taxTotalValue = this._taxTotalSnapshot;
		if (
			subtotalValue !== null &&
			subtotalValue !== undefined &&
			taxTotalValue !== null &&
			taxTotalValue !== undefined
		) {
			return subtotalValue + taxTotalValue;
		}
		return this.subtotalSnapshot + this.taxTotalSnapshot;
	}
}
