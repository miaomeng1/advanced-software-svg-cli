import { EditCommand } from '../EditCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class SetCommand extends EditCommand {
  readonly name = 'set';
  readonly syntax = 'set <id> <attr> <value>';
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(3);
    const shape = document.find(args.value(0));
    shape.set(args.value(1), args.value(2));
    return `${shape.label} updated: ${args.value(1)}=${JSON.stringify(args.value(2))}`;
  }
}
