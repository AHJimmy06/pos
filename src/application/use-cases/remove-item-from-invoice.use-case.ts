import { Invoice } from '../../domain/entities/invoice.entity';

export class RemoveItemFromInvoiceUseCase {
  execute(currentInvoice: Invoice, productId: number): Invoice {
    const newInvoice = Object.assign(
      Object.create(Object.getPrototypeOf(currentInvoice)), 
      currentInvoice
    );
    
    newInvoice.details = currentInvoice.details.filter((d) => d.productId !== productId);
    
    return newInvoice;
  }
}
