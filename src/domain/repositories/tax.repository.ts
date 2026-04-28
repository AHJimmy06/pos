import { Tax } from '../entities/tax.entity';

export abstract class TaxRepository {
  abstract findAll(): Promise<Tax[]>;
  abstract findById(id: number): Promise<Tax | null>;
}
