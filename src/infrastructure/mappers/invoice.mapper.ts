import { Invoice, InvoiceDetail } from "../../domain/entities/invoice.entity";
import type {
	InvoiceResponseDto,
	InvoiceDetailResponseDto,
	TaxSnapshotDto,
} from "../dto/api-response.dto";

// Helper to extract number from various formats: { value: 123 } or 123 or "123"
function extractNumber(
	val: number | string | { value: number | string } | undefined,
): number {
	if (val === undefined || val === null) return 0;
	if (typeof val === "number") return val;
	if (typeof val === "string") return parseFloat(val) || 0;
	if (typeof val === "object" && "value" in val) return Number(val.value);
	return 0;
}

export class InvoiceMapper {
	static toDomain(raw: InvoiceResponseDto): Invoice {
		const invoice = new Invoice(raw.clientId, raw.id);
		invoice.transactionId = raw.transactionId;
		invoice.issueDate = new Date(raw.issueDate);

		// Mapear campos de snapshot del DTO
		if (raw.status) {
			(invoice as unknown as Record<string, unknown>).status = raw.status;
		}
		if (raw.paymentMethod) {
			(invoice as unknown as Record<string, unknown>).paymentMethod =
				raw.paymentMethod;
		}
		if (raw.userId !== undefined) {
			(invoice as unknown as Record<string, unknown>).userId = raw.userId;
		}
		if (raw.clientNameSnapshot) {
			(invoice as unknown as Record<string, unknown>).clientNameSnapshot =
				raw.clientNameSnapshot;
		}
		if (raw.clientEmailSnapshot) {
			(invoice as unknown as Record<string, unknown>).clientEmailSnapshot =
				raw.clientEmailSnapshot;
		}
		if (raw.sellerNameSnapshot) {
			(invoice as unknown as Record<string, unknown>).sellerNameSnapshot =
				raw.sellerNameSnapshot;
		}
		// Mapear snapshots numéricos si están presentes (null o undefined = calcular desde details)
		if (raw.subtotalSnapshot != null) {
			(invoice as unknown as Record<string, unknown>)._subtotalSnapshot =
				raw.subtotalSnapshot;
		}
		if (raw.taxTotalSnapshot != null) {
			(invoice as unknown as Record<string, unknown>)._taxTotalSnapshot =
				raw.taxTotalSnapshot;
		}
		// _totalSnapshot no se mapea directamente, se calcula desde subtotal + tax

		if (raw.details) {
			raw.details.forEach((d: InvoiceDetailResponseDto) => {
				// Handle unitPrice from API - various formats:
				// - unitPriceSnapshot: plain number (cents from API)
				// - unitPrice: fallback
				const unitPriceInCents = extractNumber(
					d.unitPriceSnapshot ?? d.unitPrice,
				);
				// Prices are stored in cents, convert to decimal for display
				const unitPriceInDollars = unitPriceInCents / 100;

				const detail = new InvoiceDetail(
					d.productId,
					d.productName || "Producto",
					d.quantity,
					unitPriceInDollars,
					(d.detailTaxes || d.taxes || []).map((t: TaxSnapshotDto) => ({
						taxId: t.taxId,
						rate: t.rate,
					})),
				);
				invoice.addDetail(detail);
			});
		}

		return invoice;
	}

	static toPersistence(invoice: Invoice): Record<string, unknown> {
		const subtotal = invoice.subtotal;
		const taxTotal = invoice.taxTotal;
		const total = invoice.total;

		// Extraer valores numéricos de objetos Money
		const subtotalValue =
			typeof subtotal === "object" && "value" in subtotal
				? (subtotal as { value: number }).value
				: typeof subtotal === "object" && "_value" in subtotal
					? (subtotal as { _value: number })._value
					: Number(subtotal) || 0;

		const taxTotalValue =
			typeof taxTotal === "object" && "value" in taxTotal
				? (taxTotal as { value: number }).value
				: typeof taxTotal === "object" && "_value" in taxTotal
					? (taxTotal as { _value: number })._value
					: Number(taxTotal) || 0;

		const totalValue =
			typeof total === "object" && "value" in total
				? (total as { value: number }).value
				: typeof total === "object" && "_value" in total
					? (total as { _value: number })._value
					: Number(total) || 0;

		return {
			clientId: invoice.clientId,
			subtotalSnapshot: subtotalValue,
			taxTotalSnapshot: taxTotalValue,
			totalSnapshot: totalValue,
			items: invoice.details.map((d) => {
				const detailSubtotal = d.unitPrice.value * d.quantity;

				return {
					productId: d.productId,
					productName: d.productName,
					quantity: d.quantity,
					unitPrice: Math.round(d.unitPrice.value * 100), // Enviar en centavos
					taxes: d.taxes.map((t) => ({
						taxId: t.taxId,
						rate: t.rate,
						calculatedAmount: Math.round((detailSubtotal * t.rate) / 100),
					})),
				};
			}),
		};
	}
}
