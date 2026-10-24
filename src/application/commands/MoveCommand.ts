import { EditCommand } from '../EditCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class MoveCommand extends EditCommand {
  readonly name = 'move';
  readonly syntax = 'move <id> <dx> <dy>';
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(3);
    const shape = document.find(args.value(0));
    const dx = args.number(1), dy = args.number(2);
    shape.move(dx, dy);
    return shape.movementSummary(dx, dy);
  }
}
