import { InvalidArgumentException } from '../exceptions/domain.exception';

/**
 * Value Object para representar cantidades de stock.
 * Asegura que no existan cantidades negativas en el dominio.
 */
export class StockQuantity {
  private readonly _value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new InvalidArgumentException('La cantidad de stock no puede ser negativa.');
    }
    if (!Number.isInteger(value)) {
      throw new InvalidArgumentException('La cantidad de stock debe ser un número entero.');
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  hasEnough(requested: number): boolean {
    return this._value >= requested;
  }

  equals(other: StockQuantity): boolean {
    return this._value === other.value;
  }
}
