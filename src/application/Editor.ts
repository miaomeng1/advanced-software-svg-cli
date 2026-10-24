import { SvgDocument } from '../domain/SvgDocument.js';
import { History } from './History.js';
import { HistoryEntry } from './HistoryEntry.js';
import type { EditCommand } from './EditCommand.js';
import type { Arguments } from './Arguments.js';
import type { DocumentStore } from './ports/DocumentStore.js';

export class Editor {
  private current: SvgDocument | undefined;
  private path: string | undefined;
  private readonly history = new History();
  constructor(private readonly store: DocumentStore) {}
  get document(): SvgDocument {
    if (!this.current) throw new Error("no document. use 'init' or 'read' first");
    return this.current;
  }
  init(width: number, height: number): string {
    const document = new SvgDocument(width, height);
    this.current = document; this.path = undefined; this.history.barrier();
    return `canvas ${width}x${height} created`;
  }
  async read(path: string): Promise<readonly string[]> {
    const { document, warnings } = await this.store.read(path);
    this.current = document; this.path = path; this.history.barrier();
    return [...warnings, `read ${path} (${document.all().length} elements)`];
  }
  async save(path = this.path): Promise<string> {
    const document = this.document;
    if (!path) throw new Error('no save path. use save <file.svg>');
    await this.store.write(path, document);
    this.path = path; this.history.barrier();
    return `saved to ${path} (${document.all().length} elements)`;
  }
  canvas(width?: number, height?: number): string {
    const document = this.document;
    if (width === undefined) return `canvas ${document.width}x${document.height}`;
    const draft = document.clone();
    draft.resize(width, height!);
    this.current = draft; this.history.barrier();
    return `canvas resized to ${width}x${height}`;
  }
  edit(command: EditCommand, args: Arguments): string {
    const before = this.document;
    const draft = before.clone();
    const result = command.apply(draft, args);
    const entry = new HistoryEntry(before, draft, result);
    this.current = draft;
    this.history.record(entry);
    return result;
  }
  undo(): string {
    void this.document;
    const entry = this.history.undo();
    this.current = entry.undo();
    return `undone: ${entry.summary}`;
  }
  redo(): string {
    void this.document;
    const entry = this.history.redo();
    this.current = entry.redo();
    return `redone: ${entry.summary}`;
  }
}
