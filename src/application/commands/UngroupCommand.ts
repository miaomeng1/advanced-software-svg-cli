import { EditCommand } from '../EditCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class UngroupCommand extends EditCommand {
  readonly name = 'ungroup';
  readonly syntax = 'ungroup <gid>';
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1);
    document.ungroup(args.value(0));
    return `g#${args.value(0)} ungrouped`;
  }
}
