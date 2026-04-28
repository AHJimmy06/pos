import { Tax } from '../../domain/entities/tax.entity';

export class TaxMapper {
  static toDomain(raw: any): Tax {
    return new Tax(
      raw.id,
      raw._name?.value || raw.name || '',
      Number(raw._currentRate?.value || raw.currentRate || 0)
    );
  }
}
