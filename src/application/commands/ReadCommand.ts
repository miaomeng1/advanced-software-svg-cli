import { Command } from '../Command.js';
import type { Arguments } from '../Arguments.js';
import type { Editor } from '../Editor.js';

export class ReadCommand extends Command {
  readonly name = 'read';
  readonly syntax = 'read <file.svg>';
  override async execute(editor: Editor, args: Arguments): Promise<readonly string[]> {
    args.expect(1);
    return editor.read(args.value(0));
  }
}
