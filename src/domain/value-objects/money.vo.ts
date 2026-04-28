import { InvalidArgumentException } from '../exceptions/domain.exception';

/**
 * Value Object para representar dinero.
 * Maneja el redondeo y asegura que los valores sean válidos.
 */
export class Money {
  private readonly _value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new InvalidArgumentException('El valor monetario no puede ser negativo.');
    }
    // Redondeamos a 2 decimales para evitar problemas de coma flotante
    this._value = Math.round((value + Number.EPSILON) * 100) / 100;
  }

  get value(): number {
    return this._value;
  }

  add(other: Money): Money {
    return new Money(this._value + other.value);
  }

  multiply(factor: number): Money {
    return new Money(this._value * factor);
  }

  equals(other: Money): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return `$${this._value.toFixed(2)}`;
  }
}
