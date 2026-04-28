import { ApiProductRepository } from './api-product.repository';
import { ApiClientRepository } from './api-client.repository';
import { ApiTaxRepository } from './api-tax.repository';
import { ApiInvoiceRepository } from './api-invoice.repository';

export const productRepository = new ApiProductRepository();
export const clientRepository = new ApiClientRepository();
export const taxRepository = new ApiTaxRepository();
export const invoiceRepository = new ApiInvoiceRepository();
