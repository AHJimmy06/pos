import { ClientRepository } from '../../domain/repositories/client.repository';
import { Client } from '../../domain/entities/client.entity';
import { apiClient } from '../api/api-client';
import { ClientMapper } from '../mappers/client.mapper';

export class ApiClientRepository implements ClientRepository {
  async findAll(): Promise<Client[]> {
    const data: any[] = await apiClient.get('/clients');
    return data.map(ClientMapper.toDomain);
  }

  async findById(id: number): Promise<Client | null> {
    const data = await apiClient.get(`/clients/${id}`);
    return data ? ClientMapper.toDomain(data) : null;
  }

  async create(client: Omit<Client, 'id'>): Promise<Client> {
    const data = await apiClient.post('/clients', client);
    return ClientMapper.toDomain(data);
  }

  async update(id: number, client: Partial<Client>): Promise<Client> {
    const data = await apiClient.put(`/clients/${id}`, client);
    return ClientMapper.toDomain(data);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  }
}
