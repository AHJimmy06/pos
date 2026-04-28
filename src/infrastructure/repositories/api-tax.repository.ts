import { TaxRepository } from '../../domain/repositories/tax.repository';
import { Tax } from '../../domain/entities/tax.entity';
import { apiClient } from '../api/api-client';
import { TaxMapper } from '../mappers/tax.mapper';

export class ApiTaxRepository implements TaxRepository {
  async findAll(): Promise<Tax[]> {
    const data: any[] = await apiClient.get('/taxes');
    return data.map(TaxMapper.toDomain);
  }

  async findById(id: number): Promise<Tax | null> {
    const data = await apiClient.get(`/taxes/${id}`);
    return data ? TaxMapper.toDomain(data) : null;
  }
}
