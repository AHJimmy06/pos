import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepository } from '../../domain/repositories/invoice.repository';
import { EmptyInvoiceException } from '../../domain/exceptions/domain.exception';

export class FinalizeInvoiceUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(invoice: Invoice): Promise<Invoice> {
    if (invoice.details.length === 0) {
      throw new EmptyInvoiceException();
    }

    // Aquí podríamos agregar más validaciones de negocio antes de persistir
    return await this.invoiceRepository.create(invoice);
  }
}
