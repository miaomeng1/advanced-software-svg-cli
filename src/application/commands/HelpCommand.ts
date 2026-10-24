import { Command } from '../Command.js';
import type { Arguments } from '../Arguments.js';
import type { Editor } from '../Editor.js';

export class HelpCommand extends Command {
  readonly name = 'help';
  readonly syntax = 'help';
  constructor(private readonly syntaxes: readonly string[]) { super(); }
  override async execute(_editor: Editor, args: Arguments): Promise<readonly string[]> {
    args.expect(0);
    return [...this.syntaxes, 'help', '',
      'create rect <id> <x> <y> <w> <h> [fill]',
      'create circle <id> <cx> <cy> <r> [fill]',
      'create ellipse <id> <cx> <cy> <rx> <ry> [fill]',
      'create line <id> <x1> <y1> <x2> <y2> [stroke]',
      'create text <id> <x> <y> "content"',
      'create g <id>',
      'All create forms accept: in <containerId>',
      'set: fill / stroke / stroke-width / shape geometry / text (text only)',
      '# at the beginning of a line starts a comment; Ctrl-D exits.'];
  }
}
