import { Command } from '../Command.js';
import type { Arguments } from '../Arguments.js';
import type { Editor } from '../Editor.js';

export class CanvasCommand extends Command {
  readonly name = 'canvas';
  readonly syntax = 'canvas [w h]';
  override async execute(editor: Editor, args: Arguments): Promise<readonly string[]> {
    args.expect(0, 2);
    if (args.length === 1) throw new Error(`usage: ${this.syntax}`);
    return [args.length ? editor.canvas(args.number(0), args.number(1)) : editor.canvas()];
  }
}
