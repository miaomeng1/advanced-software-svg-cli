import { EditCommand } from '../EditCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class FrontCommand extends EditCommand {
  readonly name = 'front';
  readonly syntax = 'front <id>';
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1);
    document.reorder(args.value(0), true);
    return `${document.find(args.value(0)).label} moved to front`;
  }
}
