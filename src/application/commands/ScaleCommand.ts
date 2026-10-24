import { EditCommand } from '../EditCommand.js';
import type { Arguments } from '../Arguments.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';

export class ScaleCommand extends EditCommand {
  readonly name = 'scale';
  readonly syntax = 'scale <id> <factor>';
  override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2);
    const shape = document.find(args.value(0));
    const factor = args.number(1);
    shape.scale(factor);
    return `${shape.label} scaled by ${factor}`;
  }
}
