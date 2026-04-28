import { Invoice, InvoiceDetail } from '../../domain/entities/invoice.entity';

// Helper to extract number from various formats: { value: 123 } or 123 or "123"
function extractNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || 0;
  if (typeof val === 'object' && 'value' in val) return Number(val.value);
  return 0;
}

export class InvoiceMapper {
  static toDomain(raw: any): Invoice {
    const invoice = new Invoice(raw.clientId, raw.id);
    invoice.transactionId = raw.transactionId;
    invoice.issueDate = new Date(raw.issueDate);

    if (raw.details) {
      raw.details.forEach((d: any) => {
        // Handle unitPrice from API - various formats:
        // - _unitPriceSnapshot: { value: 129999 } from class-transformer
        // - unitPriceSnapshot: plain number (legacy/raw Prisma)
        const unitPriceRaw = d._unitPriceSnapshot?.value ?? d.unitPriceSnapshot ?? d.unitPrice;
        const unitPriceInCents = extractNumber(unitPriceRaw);
        // Prices are stored in cents, convert to decimal for display
        const unitPriceInDollars = unitPriceInCents / 100;

        const detail = new InvoiceDetail(
          d.productId,
          d.productName || d.product?.name || 'Producto',
          d.quantity,
          unitPriceInDollars,
          d.detailTaxes?.map((t: any) => ({
            taxId: t.taxId,
            rate: extractNumber(t.rateSnapshot) || extractNumber(t.rate) || 0
          }))
        );
        invoice.addDetail(detail);
      });
    }

    return invoice;
  }

  static toPersistence(invoice: Invoice): any {
    return {
      clientId: invoice.clientId,
      items: invoice.details.map(d => {
        // Calculate subtotal for this detail (already in dollars)
        const subtotalValue = d.unitPrice.value * d.quantity;

        return {
          productId: d.productId,
          productName: d.productName,
          quantity: d.quantity,
          unitPrice: Math.round(d.unitPrice.value * 100),
          taxes: d.taxes.map(t => {
            // Calculate the actual tax amount: subtotal * (rate / 100)
            // Rate is stored as percentage (e.g., 10 for 10%)
            const calculatedAmount = Math.round((subtotalValue * t.rate / 100) * 100) / 100;
            return {
              taxId: t.taxId,
              rate: t.rate,
              calculatedAmount
            };
          })
        };
      })
    };
  }
}
