import { Command } from './Command.js';
import type { Arguments } from './Arguments.js';
import type { Editor } from './Editor.js';
import type { SvgDocument } from '../domain/SvgDocument.js';

export abstract class EditCommand extends Command {
  override async execute(editor: Editor, args: Arguments): Promise<readonly string[]> {
    return [editor.edit(this, args)];
  }
  abstract apply(document: SvgDocument, args: Arguments): string;
}
