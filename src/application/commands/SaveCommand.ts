import { Command } from '../Command.js';
import type { Arguments } from '../Arguments.js';
import type { Editor } from '../Editor.js';

export class SaveCommand extends Command {
  readonly name = 'save';
  readonly syntax = 'save [file.svg]';
  override async execute(editor: Editor, args: Arguments): Promise<readonly string[]> {
    args.expect(0, 1);
    return [await editor.save(args.length ? args.value(0) : undefined)];
  }
}
