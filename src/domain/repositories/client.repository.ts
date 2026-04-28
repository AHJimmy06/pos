import { Client } from '../entities/client.entity';

export abstract class ClientRepository {
  abstract findAll(): Promise<Client[]>;
  abstract findById(id: number): Promise<Client | null>;
  abstract create(client: Omit<Client, 'id'>): Promise<Client>;
  abstract update(id: number, client: Partial<Client>): Promise<Client>;
  abstract delete(id: number): Promise<void>;
}
