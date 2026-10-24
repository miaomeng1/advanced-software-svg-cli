import { Command } from '../Command.js';
import type { Arguments } from '../Arguments.js';
import type { Editor } from '../Editor.js';
import { ShapePresenter } from '../ShapePresenter.js';

export class ShowCommand extends Command {
  readonly name = 'show';
  readonly syntax = 'show <id>';
  override async execute(editor: Editor, args: Arguments): Promise<readonly string[]> {
    args.expect(1);
    return new ShapePresenter().show(editor.document, args.value(0));
  }
}
