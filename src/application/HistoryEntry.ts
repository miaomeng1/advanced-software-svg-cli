import type { SvgDocument } from '../domain/SvgDocument.js';

export class HistoryEntry {
  private readonly before: SvgDocument;
  private readonly after: SvgDocument;
  constructor(before: SvgDocument, after: SvgDocument, private readonly feedback: string) {
    this.before = before.clone();
    this.after = after.clone();
  }
  undo(): SvgDocument { return this.before.clone(); }
  redo(): SvgDocument { return this.after.clone(); }
  get summary(): string { return this.feedback; }
}
