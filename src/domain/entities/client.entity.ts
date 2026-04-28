import { Email } from '../value-objects/email.vo';

export class Client {
  public email: Email;

  constructor(
    public readonly id: number,
    public firstName: string,
    public lastName: string,
    email: string | Email,
    public phone: string,
    public address: string
  ) {
    this.email = email instanceof Email ? email : new Email(email);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
