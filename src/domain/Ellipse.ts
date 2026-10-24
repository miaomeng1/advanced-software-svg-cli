import { GeometryShape } from './GeometryShape.js';

export class Ellipse extends GeometryShape {
  readonly tag = 'ellipse';
  protected readonly geometry = ['cx', 'cy', 'rx', 'ry'];
  protected readonly horizontal = ['cx'];
  protected readonly vertical = ['cy'];
  override clone(): Ellipse {
    const copy = new Ellipse(this.id);
    this.copyProperties(copy);
    return copy;
  }
}
