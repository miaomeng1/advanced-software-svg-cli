import { EditCommand } from '../EditCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class BackCommand extends EditCommand {
  readonly name = 'back';
  readonly syntax = 'back <id>';
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1);
    document.reorder(args.value(0), false);
    return `${document.find(args.value(0)).label} moved to back`;
  }
}
