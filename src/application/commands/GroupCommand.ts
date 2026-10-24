import { EditCommand } from '../EditCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class GroupCommand extends EditCommand {
  readonly name = 'group';
  readonly syntax = 'group <newGid> <id1> [id2…]';
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2, Infinity);
    const group = document.group(args.value(0), args.values(1));
    return `${group.label} created with ${group.children.length} children`;
  }
}
