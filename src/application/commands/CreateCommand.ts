import { EditCommand } from '../EditCommand.js';
import { ShapeFactory } from '../../domain/ShapeFactory.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class CreateCommand extends EditCommand {
  readonly name = 'create';
  readonly syntax = 'create <type> <id> [params…] [in <containerId>]';
  constructor(private readonly factory = new ShapeFactory()) { super(); }
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2, Infinity);
    const { values, parentId } = args.creation();
    if (values.length < 2) throw new Error(`usage: ${this.syntax}`);
    document.ensureAvailable(values[1]!);
    const shape = this.factory.create(values[0]!, values[1]!, values.slice(2));
    document.add(shape, parentId);
    return `${shape.label} created${parentId === undefined ? '' : ` in g#${parentId}`}`;
  }
}
