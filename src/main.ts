import { Editor } from './application/Editor.js';
import { FileDocumentStore } from './infrastructure/FileDocumentStore.js';
import { CommandRunner } from './cli/CommandRunner.js';
import { Repl } from './cli/Repl.js';

const repl = new Repl(new CommandRunner(new Editor(new FileDocumentStore())),
  process.stdin, process.stdout, Boolean(process.stdin.isTTY));
const succeeded = await repl.start();
if (!succeeded && !process.stdin.isTTY) process.exitCode = 1;
