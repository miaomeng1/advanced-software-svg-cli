import { Command } from '../Command.js';
import type { Arguments } from '../Arguments.js';
import type { Editor } from '../Editor.js';

export class UndoCommand extends Command {
  readonly name = 'undo';
  readonly syntax = 'undo';
  override async execute(editor: Editor, args: Arguments): Promise<readonly string[]> {
    args.expect(0);
    return [editor.undo()];
  }
}
