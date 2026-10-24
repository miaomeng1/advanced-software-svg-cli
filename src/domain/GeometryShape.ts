import { Shape } from './Shape.js';
import { Value } from './Value.js';

export abstract class GeometryShape extends Shape {
  protected abstract readonly geometry: readonly string[];
  protected abstract readonly horizontal: readonly string[];
  protected abstract readonly vertical: readonly string[];
  protected readonly paint: string = 'fill';
  protected readonly dimensions: readonly string[] = ['width', 'height', 'r', 'rx', 'ry'];
  protected number(name: string): number { return Number(this.get(name) ?? 0); }
  override initialize(args: readonly string[]): void {
    if (args.length < this.geometry.length || args.length > this.geometry.length + 1) {
      throw new Error(`invalid parameters for ${this.tag}: expected ${this.geometry.join(' ')} [${this.paint}]`);
    }
    this.geometry.forEach((key, index) => this.set(key, args[index]!));
    if (args[this.geometry.length] !== undefined) this.set(this.paint, args[this.geometry.length]!);
  }
  override set(name: string, value: string): void {
    if (this.geometry.includes(name)) {
      const number = this.dimensions.includes(name) ? Value.nonnegative(value, name) : Value.number(value);
      this.put(name, String(number));
    } else super.set(name, value);
  }
  override importAttributes(attributes: Readonly<Record<string, string>>): void {
    super.importAttributes(attributes);
    for (const name of this.geometry) this.set(name, attributes[name] ?? '0');
  }
  override move(dx: number, dy: number): void {
    this.horizontal.forEach(key => this.set(key, String(this.number(key) + dx)));
    this.vertical.forEach(key => this.set(key, String(this.number(key) + dy)));
  }
  override scale(factor: number): void {
    Value.positive(factor, 'scale factor');
    this.geometry.forEach(key => this.set(key, String(this.number(key) * factor)));
  }
  override summary(): string {
    const aliases: Readonly<Record<string, string>> = { width: 'w', height: 'h' };
    return `${this.label}  ${this.geometry.map(key => `${aliases[key] ?? key}=${this.number(key)}`).join(' ')}${this.styleSummary()}`;
  }
  override movementSummary(_dx: number, _dy: number): string {
    return `${this.label} moved to (${this.number(this.horizontal[0]!)},${this.number(this.vertical[0]!)})`;
  }
}
