import { Value } from './Value.js';

export abstract class Shape {
  private readonly properties = new Map<string, string>();
  abstract readonly tag: string;
  constructor(private readonly identity: string) { Value.id(identity); }
  get id(): string { return this.identity; }
  get label(): string { return `${this.tag}#${this.id}`; }
  get children(): readonly Shape[] { return []; }
  get text(): string | undefined { return undefined; }
  get attributes(): Readonly<Record<string, string>> {
    return Object.freeze(Object.fromEntries(this.properties));
  }
  protected put(name: string, value: string): void { this.properties.set(name, value); }
  protected get(name: string): string | undefined { return this.properties.get(name); }
  protected copyProperties(target: Shape): void {
    this.properties.forEach((value, key) => target.put(key, value));
  }
  set(name: string, value: string): void {
    if (!['fill', 'stroke', 'stroke-width'].includes(name)) throw new Error(`unknown attribute: ${name}`);
    if (name === 'stroke-width') value = String(Value.nonnegative(value, name));
    this.put(name, value);
  }
  importAttributes(attributes: Readonly<Record<string, string>>): void {
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'id' || key === 'xmlns') continue;
      // Static SVG subset: preserve passive styling; never import executable content.
      if (/^on/i.test(key) || ['href', 'xlink:href', 'style', 'transform'].includes(key)) {
        throw new Error(`unsupported SVG attribute: ${key}`);
      }
      if (['fill', 'stroke', 'stroke-width'].includes(key)) this.set(key, value);
      else this.put(key, value);
    }
  }
  protected styleSummary(): string {
    return ['fill', 'stroke', 'stroke-width'].filter(key => this.get(key) !== undefined)
      .map(key => ` ${key}=${this.get(key)}`).join('');
  }
  append(_child: Shape, _index?: number): void { throw new Error(`not a container: ${this.id}`); }
  remove(_child: Shape): void { throw new Error(`not a container: ${this.id}`); }
  get isContainer(): boolean { return false; }
  abstract initialize(args: readonly string[]): void;
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
  abstract summary(): string;
  abstract movementSummary(dx: number, dy: number): string;
  contains(id: string): boolean { return this.id === id || this.children.some(child => child.contains(id)); }
}
