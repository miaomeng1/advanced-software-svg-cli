import { Command } from '../Command.js';
import type { Arguments } from '../Arguments.js';
import type { Editor } from '../Editor.js';
import { ShapePresenter } from '../ShapePresenter.js';

export class TreeCommand extends Command {
  readonly name = 'tree';
  readonly syntax = 'tree [id]';
  override async execute(editor: Editor, args: Arguments): Promise<readonly string[]> {
    args.expect(0, 1);
    return new ShapePresenter().tree(editor.document, args.length ? args.value(0) : undefined);
  }
}
