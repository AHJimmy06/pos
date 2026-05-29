import { ClientRepository } from '../../domain/repositories/client.repository';
import { Client } from '../../domain/entities/client.entity';
import { apiClient } from '../api/api-client';
import { ClientMapper } from '../mappers/client.mapper';
import type { ClientResponseDto } from '../dto/api-response.dto';

export class ApiClientRepository implements ClientRepository {
  async findAll(): Promise<Client[]> {
    const response = await apiClient.get<ClientResponseDto[]>('/clients');
    const data: ClientResponseDto[] = (response as unknown as { data: ClientResponseDto[] }).data;
    return data.map(ClientMapper.toDomain);
  }

  async findById(id: number): Promise<Client | null> {
    const response = await apiClient.get<ClientResponseDto>(`/clients/${id}`);
    const data: ClientResponseDto = (response as unknown as { data: ClientResponseDto }).data;
    return data ? ClientMapper.toDomain(data) : null;
  }

  async create(client: Omit<Client, 'id'>): Promise<Client> {
    const response = await apiClient.post<ClientResponseDto>('/clients', client);
    const data: ClientResponseDto = (response as unknown as { data: ClientResponseDto }).data;
    return ClientMapper.toDomain(data);
  }

  async update(id: number, client: Partial<Client>): Promise<Client> {
    const response = await apiClient.put<ClientResponseDto>(`/clients/${id}`, client);
    const data: ClientResponseDto = (response as unknown as { data: ClientResponseDto }).data;
    return ClientMapper.toDomain(data);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  }
}
