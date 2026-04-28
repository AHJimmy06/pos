import { describe, it, expect } from 'vitest';
import { Money } from './money.vo';
import { InvalidArgumentException } from '../exceptions/domain.exception';

describe('Money Value Object', () => {
  it('debería crearse correctamente con un valor válido', () => {
    const money = new Money(100.50);
    expect(money.value).toBe(100.50);
  });

  it('debería lanzar InvalidArgumentException si el valor es negativo', () => {
    expect(() => new Money(-1)).toThrow(InvalidArgumentException);
    expect(() => new Money(-1)).toThrow('El valor monetario no puede ser negativo.');
  });

  it('debería redondear a dos decimales correctamente', () => {
    const money = new Money(100.555); // Debería redondear a 100.56
    expect(money.value).toBe(100.56);
  });

  it('debería sumar otros valores de Money correctamente', () => {
    const m1 = new Money(10.25);
    const m2 = new Money(5.75);
    const result = m1.add(m2);
    
    expect(result.value).toBe(16.00);
    expect(result).toBeInstanceOf(Money);
  });

  it('debería multiplicar por un factor correctamente', () => {
    const money = new Money(10);
    const result = money.multiply(3);
    expect(result.value).toBe(30);
  });

  it('debería comparar igualdad correctamente', () => {
    const m1 = new Money(10.50);
    const m2 = new Money(10.50);
    const m3 = new Money(11);
    
    expect(m1.equals(m2)).toBe(true);
    expect(m1.equals(m3)).toBe(false);
  });
});
