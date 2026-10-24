import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';
import type { CommandRunner } from './CommandRunner.js';

export class Repl {
  constructor(private readonly runner: CommandRunner, private readonly input: Readable,
    private readonly output: Writable, private readonly interactive: boolean) {}
  async start(): Promise<boolean> {
    const lines = createInterface({ input: this.input, output: this.output, terminal: this.interactive });
    let succeeded = true;
    if (this.interactive) this.output.write("svg-editor 0.1 — type 'help' for commands\n\nsvg> ");
    for await (const line of lines) {
      const results = await this.runner.run(line);
      for (const result of results) {
        this.output.write(result + '\n');
        if (result.startsWith('error:')) succeeded = false;
      }
      if (this.interactive) this.output.write('svg> ');
    }
    return succeeded;
  }
}
