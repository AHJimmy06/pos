import { InvoiceRepository } from '../../domain/repositories/invoice.repository';
import { Invoice } from '../../domain/entities/invoice.entity';
import { apiClient } from '../api/api-client';
import { InvoiceMapper } from '../mappers/invoice.mapper';
import type { InvoiceResponseDto, PaginatedResponse } from '../dto/api-response.dto';

export class ApiInvoiceRepository implements InvoiceRepository {
  async findAll(): Promise<Invoice[]> {
    const response = await apiClient.get<InvoiceResponseDto[]>('/invoices');
    const data: InvoiceResponseDto[] = (response as unknown as { data: InvoiceResponseDto[] }).data;
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
    const response = await apiClient.get<PaginatedResponse<InvoiceResponseDto>>(`/invoices?${params.toString()}`);
    const data: PaginatedResponse<InvoiceResponseDto> = (response as unknown as { data: PaginatedResponse<InvoiceResponseDto> }).data;
    return {
      data: data.data.map(InvoiceMapper.toDomain),
      total: data.total,
    };
  }

  async findById(id: number): Promise<Invoice | null> {
    const response = await apiClient.get<InvoiceResponseDto>(`/invoices/${id}`);
    const data: InvoiceResponseDto = (response as unknown as { data: InvoiceResponseDto }).data;
    return data ? InvoiceMapper.toDomain(data) : null;
  }

  async create(invoice: Invoice): Promise<Invoice> {
    const persistenceData = InvoiceMapper.toPersistence(invoice);
    const response = await apiClient.post<InvoiceResponseDto>('/invoices', persistenceData);
    const data: InvoiceResponseDto = (response as unknown as { data: InvoiceResponseDto }).data;
    return InvoiceMapper.toDomain(data);
  }
}
