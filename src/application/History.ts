import { HistoryEntry } from './HistoryEntry.js';

export class History {
  private readonly past: HistoryEntry[] = [];
  private readonly future: HistoryEntry[] = [];
  private blocked = true;
  barrier(): void {
    this.past.length = 0; this.future.length = 0; this.blocked = true;
  }
  record(entry: HistoryEntry): void {
    this.past.push(entry); this.future.length = 0; this.blocked = false;
  }
  undo(): HistoryEntry {
    if (this.blocked) throw new Error('undo not allowed after io command');
    const entry = this.past.pop();
    if (!entry) throw new Error('nothing to undo');
    this.future.push(entry);
    return entry;
  }
  redo(): HistoryEntry {
    if (this.blocked) throw new Error('undo not allowed after io command');
    const entry = this.future.pop();
    if (!entry) throw new Error('nothing to redo');
    this.past.push(entry);
    return entry;
  }
}
