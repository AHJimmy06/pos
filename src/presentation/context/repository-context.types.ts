import type { ClientRepository } from '../../domain/repositories/client.repository';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import type { TaxRepository } from '../../domain/repositories/tax.repository';
import type { InvoiceRepository } from '../../domain/repositories/invoice.repository';

export interface RepositoryContextProps {
  clientRepository: ClientRepository;
  productRepository: ProductRepository;
  taxRepository: TaxRepository;
  invoiceRepository: InvoiceRepository;
}

export type { ClientRepository } from '../../domain/repositories/client.repository';
export type { ProductRepository } from '../../domain/repositories/product.repository';
export type { TaxRepository } from '../../domain/repositories/tax.repository';
export type { InvoiceRepository } from '../../domain/repositories/invoice.repository';
