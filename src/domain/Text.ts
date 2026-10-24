import { GeometryShape } from './GeometryShape.js';

export class Text extends GeometryShape {
  readonly tag = 'text';
  protected readonly geometry = ['x', 'y'];
  protected readonly horizontal = ['x'];
  protected readonly vertical = ['y'];
  private content = '';
  override get text(): string { return this.content; }
  override initialize(args: readonly string[]): void {
    if (args.length !== 3) throw new Error('invalid parameters for text: expected x y "content"');
    this.set('x', args[0]!);
    this.set('y', args[1]!);
    this.set('text', args[2]!);
  }
  override set(name: string, value: string): void {
    if (name === 'text') this.content = value;
    else super.set(name, value);
  }
  override clone(): Text {
    const copy = new Text(this.id);
    this.copyProperties(copy);
    copy.content = this.content;
    return copy;
  }
  override summary(): string {
    return `${this.label} (${this.number('x')},${this.number('y')}) ${JSON.stringify(this.text)}${this.styleSummary()}`;
  }
}
