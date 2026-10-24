import { GeometryShape } from './GeometryShape.js';

export class Line extends GeometryShape {
  readonly tag = 'line';
  protected readonly geometry = ['x1', 'y1', 'x2', 'y2'];
  protected readonly horizontal = ['x1', 'x2'];
  protected readonly vertical = ['y1', 'y2'];
  protected override readonly paint = 'stroke';
  override summary(): string {
    return `${this.label}  (${this.number('x1')},${this.number('y1')}) -> (${this.number('x2')},${this.number('y2')})${this.styleSummary()}`;
  }
  override clone(): Line {
    const copy = new Line(this.id);
    this.copyProperties(copy);
    return copy;
  }
}
