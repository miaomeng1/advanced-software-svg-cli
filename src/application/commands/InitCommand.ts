import { Command } from '../Command.js';
import type { Arguments } from '../Arguments.js';
import type { Editor } from '../Editor.js';

export class InitCommand extends Command {
  readonly name = 'init';
  readonly syntax = 'init [w] [h]';
  override async execute(editor: Editor, args: Arguments): Promise<readonly string[]> {
    args.expect(0, 2);
    return [editor.init(args.length > 0 ? args.number(0) : 800, args.length > 1 ? args.number(1) : 600)];
  }
}
