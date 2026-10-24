import { Arguments } from '../application/Arguments.js';
import type { Editor } from '../application/Editor.js';
import { CommandRegistry } from './CommandRegistry.js';
import { Tokenizer } from './Tokenizer.js';

export class CommandRunner {
  constructor(private readonly editor: Editor,
    private readonly registry = new CommandRegistry(), private readonly tokenizer = new Tokenizer()) {}
  async run(line: string): Promise<readonly string[]> {
    try {
      const tokens = this.tokenizer.parse(line);
      if (!tokens.length) return [];
      const command = this.registry.find(tokens[0]!.value);
      return await command.execute(this.editor, new Arguments(tokens.slice(1), command.syntax));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [`error: ${message.replace(/[\r\n]+/g, ' ')}`];
    }
  }
}
