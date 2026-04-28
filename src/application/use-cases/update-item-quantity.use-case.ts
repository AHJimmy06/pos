import { Invoice, InvoiceDetail } from '../../domain/entities/invoice.entity';
import { InsufficientStockException } from '../../domain/exceptions/domain.exception';

export class UpdateItemQuantityUseCase {
  execute(currentInvoice: Invoice, productId: number, delta: number, availableStock: number, productName: string): Invoice {
    const newInvoice = Object.assign(
      Object.create(Object.getPrototypeOf(currentInvoice)), 
      currentInvoice
    );

    newInvoice.details = currentInvoice.details.map((d) => {
      if (d.productId === productId) {
        const newQty = d.quantity + delta;
        
        if (newQty < 1) return d; // No permitimos cantidad < 1 (para eso está remove)
        
        if (newQty > availableStock) {
          throw new InsufficientStockException(productName, availableStock);
        }
        
        return new InvoiceDetail(d.productId, d.productName, newQty, d.unitPrice, d.taxes);
      }
      return d;
    });

    return newInvoice;
  }
}
