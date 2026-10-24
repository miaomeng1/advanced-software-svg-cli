import { EditCommand } from '../EditCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class AddToCommand extends EditCommand {
  readonly name = 'addto';
  readonly syntax = 'addto <gid> <id>';
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2);
    document.addTo(args.value(0), args.value(1));
    return `${document.find(args.value(1)).label} added to g#${args.value(0)}`;
  }
}
