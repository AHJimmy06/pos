import { Invoice, InvoiceDetail } from '../../domain/entities/invoice.entity';
import { Product } from '../../domain/entities/product.entity';
import { Tax } from '../../domain/entities/tax.entity';
import { InsufficientStockException } from '../../domain/exceptions/domain.exception';

export class AddItemToInvoiceUseCase {
  execute(currentInvoice: Invoice, product: Product, quantity: number, taxes: Tax[]): Invoice {
    const newInvoice = Object.assign(
      Object.create(Object.getPrototypeOf(currentInvoice)), 
      currentInvoice
    );
    newInvoice.details = [...currentInvoice.details];

    const existingDetail = newInvoice.details.find((d: InvoiceDetail) => d.productId === product.id);
    const currentQty = existingDetail ? existingDetail.quantity : 0;

    // Usamos el método canSell del dominio y lanzamos excepción específica
    if (!product.canSell(currentQty + quantity)) {
      throw new InsufficientStockException(product.name, product.stock.value);
    }

    if (existingDetail) {
      const updatedDetail = new InvoiceDetail(
        existingDetail.productId,
        existingDetail.productName,
        existingDetail.quantity + quantity,
        existingDetail.unitPrice,
        existingDetail.taxes
      );
      newInvoice.details = newInvoice.details.map((d: InvoiceDetail) => 
        d.productId === product.id ? updatedDetail : d
      );
    } else {
      const detail = new InvoiceDetail(
        product.id,
        product.name,
        quantity,
        product.price,
        taxes.map(t => ({ taxId: t.id, rate: t.currentRate }))
      );
      newInvoice.addDetail(detail);
    }

    return newInvoice;
  }
}
