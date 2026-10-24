import { Value } from '../domain/Value.js';
import type { Token } from './Token.js';

export class Arguments {
  constructor(private readonly tokens: readonly Token[], private readonly syntax: string) {}
  get length(): number { return this.tokens.length; }
  expect(min: number, max = min): void {
    if (this.length < min || this.length > max) throw new Error(`usage: ${this.syntax}`);
  }
  value(index: number): string {
    const token = this.tokens[index];
    if (!token) throw new Error(`usage: ${this.syntax}`);
    return token.value;
  }
  number(index: number): number { return Value.number(this.value(index)); }
  values(start = 0): readonly string[] { return this.tokens.slice(start).map(token => token.value); }
  creation(): { values: readonly string[]; parentId?: string } {
    const suffix = this.tokens[this.length - 2];
    if (suffix?.value === 'in' && !suffix.quoted) {
      return { values: this.tokens.slice(0, -2).map(token => token.value), parentId: this.value(this.length - 1) };
    }
    return { values: this.values() };
  }
}
