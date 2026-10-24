import { GeometryShape } from './GeometryShape.js';

export class Circle extends GeometryShape {
  readonly tag = 'circle';
  protected readonly geometry = ['cx', 'cy', 'r'];
  protected readonly horizontal = ['cx'];
  protected readonly vertical = ['cy'];
  override clone(): Circle {
    const copy = new Circle(this.id);
    this.copyProperties(copy);
    return copy;
  }
}
