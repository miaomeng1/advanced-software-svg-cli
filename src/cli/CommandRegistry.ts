import { Command } from '../application/Command.js';
import { HelpCommand } from '../application/commands/HelpCommand.js';
import { InitCommand } from '../application/commands/InitCommand.js';
import { ReadCommand } from '../application/commands/ReadCommand.js';
import { SaveCommand } from '../application/commands/SaveCommand.js';
import { CanvasCommand } from '../application/commands/CanvasCommand.js';
import { CreateCommand } from '../application/commands/CreateCommand.js';
import { DeleteCommand } from '../application/commands/DeleteCommand.js';
import { MoveCommand } from '../application/commands/MoveCommand.js';
import { ScaleCommand } from '../application/commands/ScaleCommand.js';
import { SetCommand } from '../application/commands/SetCommand.js';
import { GroupCommand } from '../application/commands/GroupCommand.js';
import { UngroupCommand } from '../application/commands/UngroupCommand.js';
import { AddToCommand } from '../application/commands/AddToCommand.js';
import { FrontCommand } from '../application/commands/FrontCommand.js';
import { BackCommand } from '../application/commands/BackCommand.js';
import { TreeCommand } from '../application/commands/TreeCommand.js';
import { ShowCommand } from '../application/commands/ShowCommand.js';
import { UndoCommand } from '../application/commands/UndoCommand.js';
import { RedoCommand } from '../application/commands/RedoCommand.js';

export class CommandRegistry {
  // Name dispatch 2/2. Future plugin phase: inject command providers.
  private readonly commands = new Map<string, Command>();
  constructor() {
    const commands: Command[] = [new InitCommand(), new ReadCommand(), new SaveCommand(), new CanvasCommand(), new CreateCommand(), new DeleteCommand(), new MoveCommand(), new ScaleCommand(), new SetCommand(), new GroupCommand(), new UngroupCommand(), new AddToCommand(), new FrontCommand(), new BackCommand(), new TreeCommand(), new ShowCommand(), new UndoCommand(), new RedoCommand()];
    commands.push(new HelpCommand(commands.map(command => command.syntax)));
    commands.forEach(command => this.commands.set(command.name, command));
  }
  find(name: string): Command {
    const command = this.commands.get(name);
    if (!command) throw new Error(`unknown command: ${name}`);
    return command;
  }
}
