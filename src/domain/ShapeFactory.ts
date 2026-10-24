import { Shape } from './Shape.js';
import { Rect } from './Rect.js';
import { Circle } from './Circle.js';
import { Ellipse } from './Ellipse.js';
import { Line } from './Line.js';
import { Text } from './Text.js';
import { Group } from './Group.js';

export class ShapeFactory {
  // Name dispatch 1/2. Future plugin phase: replace built-in registration with providers.
  private readonly constructors: ReadonlyMap<string, new (id: string) => Shape> = new Map([
    ['rect', Rect], ['circle', Circle], ['ellipse', Ellipse], ['line', Line], ['text', Text], ['g', Group],
  ] as [string, new (id: string) => Shape][]);
  empty(type: string, id: string): Shape {
    const Constructor = this.constructors.get(type);
    if (!Constructor) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    return new Constructor(id);
  }
  create(type: string, id: string, args: readonly string[]): Shape {
    const shape = this.empty(type, id);
    shape.initialize(args);
    return shape;
  }
}
