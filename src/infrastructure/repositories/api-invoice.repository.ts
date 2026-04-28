import { InvoiceRepository } from '../../domain/repositories/invoice.repository';
import { Invoice } from '../../domain/entities/invoice.entity';
import { apiClient } from '../api/api-client';
import { InvoiceMapper } from '../mappers/invoice.mapper';

export class ApiInvoiceRepository implements InvoiceRepository {
  async findAll(): Promise<Invoice[]> {
    const data: any[] = await apiClient.get('/invoices');
    return data.map(InvoiceMapper.toDomain);
  }

  async findAllPaginated(page: number, limit: number, searchId?: number): Promise<{ data: Invoice[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (searchId) {
      params.append('searchId', searchId.toString());
    }
    const data: any = await apiClient.get(`/invoices?${params.toString()}`);
    return {
      data: data.data.map(InvoiceMapper.toDomain),
      total: data.total,
    };
  }

  async findById(id: number): Promise<Invoice | null> {
    const data = await apiClient.get(`/invoices/${id}`);
    return data ? InvoiceMapper.toDomain(data) : null;
  }

  async create(invoice: Invoice): Promise<Invoice> {
    const persistenceData = InvoiceMapper.toPersistence(invoice);
    const data = await apiClient.post('/invoices', persistenceData);
    return InvoiceMapper.toDomain(data);
  }
}
