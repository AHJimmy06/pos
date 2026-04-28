import { InvalidArgumentException } from '../exceptions/domain.exception';

export class Email {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.validate(value)) {
      throw new InvalidArgumentException(`El formato del email "${value}" es inválido.`);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  private validate(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  equals(other: Email): boolean {
    return this._value === other.value;
  }
}
