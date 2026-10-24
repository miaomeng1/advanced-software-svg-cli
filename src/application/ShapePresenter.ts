import type { Shape } from '../domain/Shape.js';
import type { SvgDocument } from '../domain/SvgDocument.js';

export class ShapePresenter {
  tree(document: SvgDocument, id?: string): readonly string[] {
    const lines: string[] = [];
    const children = (items: readonly Shape[], prefix: string): void => {
      items.forEach((shape, index) => {
        const last = index === items.length - 1;
        lines.push(`${prefix}${last ? '└── ' : '├── '}${shape.summary()}`);
        children(shape.children, prefix + (last ? '    ' : '│   '));
      });
    };
    if (id !== undefined) {
      const root = document.find(id);
      lines.push(root.summary()); children(root.children, '');
    } else {
      lines.push(`svg (${document.width}x${document.height})`); children(document.children, '');
    }
    return lines;
  }
  show(document: SvgDocument, id: string): readonly string[] {
    const shape = document.find(id);
    const lines = [`${shape.label}  parent=${document.parentLabel(shape)}`];
    const values = Object.entries(shape.attributes).map(([key, value]) => `${key}=${value}`);
    if (values.length) lines.push(`  ${values.join(' ')}`);
    if (shape.text !== undefined) lines.push(`  text=${JSON.stringify(shape.text)}`);
    if (shape.isContainer) lines.push(`  children=${shape.children.length}`);
    return lines;
  }
}
