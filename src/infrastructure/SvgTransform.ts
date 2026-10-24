import type { Shape } from '../domain/Shape.js';
import { Value } from '../domain/Value.js';

/** Normalizes the translate / uniform positive scale subset into shape geometry. */
export class SvgTransform {
  private factor = 1;
  private dx = 0;
  private dy = 0;
  constructor(source: string) {
    const pattern = /\s*(translate|scale)\s*\(([^)]*)\)\s*,?\s*/gy;
    let offset = 0;
    while (offset < source.length) {
      pattern.lastIndex = offset;
      const match = pattern.exec(source);
      if (!match) throw new Error('unsupported SVG transform: expected translate / positive uniform scale');
      const values = match[2]!.trim().split(/[\s,]+/).map(value => Value.number(value));
      if (values.length < 1 || values.length > 2) throw new Error('invalid SVG transform');
      // Transform operators are parsed here, not dispatched by shape type.
      if (match[1] === 'translate') {
        this.dx = Value.number(this.dx + this.factor * values[0]!);
        this.dy = Value.number(this.dy + this.factor * (values[1] ?? 0));
      } else {
        const factor = Value.positive(values[0]!, 'transform scale');
        if (values.length === 2 && values[1] !== factor) throw new Error('unsupported nonuniform SVG scale');
        this.factor = Value.number(this.factor * factor);
      }
      offset = pattern.lastIndex;
    }
  }
  apply(shape: Shape): void {
    shape.scale(this.factor);
    shape.move(this.dx, this.dy);
  }
}
