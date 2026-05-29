import { createContext, type Context } from 'react';
import type { ClientRepository } from '../../domain/repositories/client.repository';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import type { TaxRepository } from '../../domain/repositories/tax.repository';
import type { InvoiceRepository } from '../../domain/repositories/invoice.repository';

export interface RepositoryContextValue {
  clientRepository: ClientRepository;
  productRepository: ProductRepository;
  taxRepository: TaxRepository;
  invoiceRepository: InvoiceRepository;
}

export const RepositoryContext: Context<RepositoryContextValue | null> = createContext<RepositoryContextValue | null>(null);
