import type { Arguments } from './Arguments.js';
import type { Editor } from './Editor.js';

export abstract class Command {
  abstract readonly name: string;
  abstract readonly syntax: string;
  abstract execute(editor: Editor, args: Arguments): Promise<readonly string[]>;
}
