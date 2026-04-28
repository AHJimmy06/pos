/**
 * Clase base para todas las excepciones de dominio.
 * Permite capturar errores de lógica de negocio de forma centralizada.
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InsufficientStockException extends DomainException {
  constructor(productName: string, available: number) {
    super(`Stock insuficiente para "${productName}". Disponible: ${available}`);
  }
}

export class InvalidArgumentException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class EmptyInvoiceException extends DomainException {
  constructor() {
    super('No se puede procesar una factura sin ítems.');
  }
}
