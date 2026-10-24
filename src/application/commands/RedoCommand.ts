import { Command } from '../Command.js';
import type { Arguments } from '../Arguments.js';
import type { Editor } from '../Editor.js';

export class RedoCommand extends Command {
  readonly name = 'redo';
  readonly syntax = 'redo';
  override async execute(editor: Editor, args: Arguments): Promise<readonly string[]> {
    args.expect(0);
    return [editor.redo()];
  }
}
