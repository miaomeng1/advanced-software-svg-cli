export class Value {
  static number(value: string | number): number {
    if (typeof value === 'string' && !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
      throw new Error(`invalid number: ${value}`);
    }
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`invalid number: ${value}`);
    return Object.is(number, -0) ? 0 : number;
  }

  static nonnegative(value: string | number, name: string): number {
    const number = this.number(value);
    if (number < 0) throw new Error(`${name} must be nonnegative`);
    return number;
  }

  static positive(value: string | number, name: string): number {
    const number = this.number(value);
    if (number <= 0) throw new Error(`${name} must be positive`);
    return number;
  }

  static id(id: string): void {
    if (!id || /[\s\x00-\x1f]/u.test(id)) throw new Error(`invalid id: ${id}`);
  }
}
