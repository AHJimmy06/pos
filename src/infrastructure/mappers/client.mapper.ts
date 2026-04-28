import { Client } from '../../domain/entities/client.entity';

export class ClientMapper {
  static toDomain(raw: any): Client {
    // Adaptamos el formato de Value Objects del API (_firstName.value)
    return new Client(
      raw.id,
      raw._firstName?.value || raw.firstName || '',
      raw._lastName?.value || raw.lastName || '',
      raw._email?.value || raw.email || '',
      raw.phone || '',
      raw.address || ''
    );
  }

  static toPersistence(client: Client): any {
    return {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email.value, // Extraemos el valor primitivo
      phone: client.phone,
      address: client.address
    };
  }
}
