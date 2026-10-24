import { GeometryShape } from './GeometryShape.js';

export class Rect extends GeometryShape {
  readonly tag = 'rect';
  protected readonly geometry = ['x', 'y', 'width', 'height'];
  protected readonly horizontal = ['x'];
  protected readonly vertical = ['y'];
  override clone(): Rect {
    const copy = new Rect(this.id);
    this.copyProperties(copy);
    return copy;
  }
}
