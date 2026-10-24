import { Shape } from './Shape.js';
import { Value } from './Value.js';

export class Group extends Shape {
  readonly tag = 'g';
  constructor(id: string, private readonly documentRoot = false) { super(id); }
  private readonly members: Shape[] = [];
  override get children(): readonly Shape[] { return this.members.slice(); }
  override get isContainer(): boolean { return true; }
  override contains(id: string): boolean {
    return (!this.documentRoot && this.id === id) || this.children.some(child => child.contains(id));
  }
  override initialize(args: readonly string[]): void {
    if (args.length) throw new Error('invalid parameters for g: expected only id');
  }
  override append(child: Shape, index = this.members.length): void {
    if (!this.documentRoot && child.contains(this.id)) throw new Error(`cannot move a container into its own descendant: ${child.id}`);
    if (this.contains(child.id)) throw new Error(`id already exists: ${child.id}`);
    this.members.splice(index, 0, child);
  }
  override remove(child: Shape): void {
    const index = this.members.indexOf(child);
    if (index < 0) throw new Error(`no such shape: ${child.id}`);
    this.members.splice(index, 1);
  }
  override move(dx: number, dy: number): void { this.members.forEach(child => child.move(dx, dy)); }
  override scale(factor: number): void {
    Value.positive(factor, 'scale factor');
    this.members.forEach(child => child.scale(factor));
  }
  override clone(): Group {
    const copy = new Group(this.id, this.documentRoot);
    this.copyProperties(copy);
    this.members.forEach(child => copy.append(child.clone()));
    return copy;
  }
  override summary(): string { return this.label + this.styleSummary(); }
  override movementSummary(dx: number, dy: number): string { return `${this.label} moved by (${dx},${dy})`; }
}
