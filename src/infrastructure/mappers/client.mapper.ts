import { Client } from '../../domain/entities/client.entity';
import type { ClientResponseDto } from '../dto/api-response.dto';

export class ClientMapper {
  static toDomain(raw: ClientResponseDto): Client {
    return new Client(
      raw.id,
      raw.firstName || '',
      raw.lastName || '',
      raw.email || '',
      raw.phone || '',
      raw.address || ''
    );
  }

  static toPersistence(client: Client): Record<string, unknown> {
    return {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address
    };
  }
}
