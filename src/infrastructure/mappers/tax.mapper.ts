import { Tax } from '../../domain/entities/tax.entity';
import type { TaxResponseDto } from '../dto/api-response.dto';

export class TaxMapper {
  static toDomain(raw: TaxResponseDto): Tax {
    return new Tax(
      raw.id,
      raw.name || '',
      Number(raw.currentRate || 0)
    );
  }
}
