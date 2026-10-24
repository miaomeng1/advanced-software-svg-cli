import { EditCommand } from '../EditCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class DeleteCommand extends EditCommand {
  readonly name = 'delete';
  readonly syntax = 'delete <id>';
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1);
    const shape = document.delete(args.value(0));
    return `${shape.label} deleted`;
  }
}
