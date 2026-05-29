import { TaxRepository } from '../../domain/repositories/tax.repository';
import { Tax } from '../../domain/entities/tax.entity';
import { apiClient } from '../api/api-client';
import { TaxMapper } from '../mappers/tax.mapper';
import type { TaxResponseDto } from '../dto/api-response.dto';

export class ApiTaxRepository implements TaxRepository {
  async findAll(): Promise<Tax[]> {
    const response = await apiClient.get<TaxResponseDto[]>('/taxes');
    const data: TaxResponseDto[] = (response as unknown as { data: TaxResponseDto[] }).data;
    return data.map(TaxMapper.toDomain);
  }

  async findById(id: number): Promise<Tax | null> {
    const response = await apiClient.get<TaxResponseDto>(`/taxes/${id}`);
    const data: TaxResponseDto = (response as unknown as { data: TaxResponseDto }).data;
    return data ? TaxMapper.toDomain(data) : null;
  }
}
