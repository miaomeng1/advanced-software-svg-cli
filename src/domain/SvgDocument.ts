import { Group } from './Group.js';
import { Shape } from './Shape.js';
import { Value } from './Value.js';

export class SvgDocument {
  private readonly root: Group;
  private canvasWidth: number;
  private canvasHeight: number;
  private viewport: string;
  constructor(width = 800, height = 600, root = new Group('__root__', true), viewBox?: string) {
    this.canvasWidth = Value.positive(width, 'width');
    this.canvasHeight = Value.positive(height, 'height');
    this.root = root;
    this.viewport = viewBox ?? `0 0 ${width} ${height}`;
  }
  get attributes(): Readonly<Record<string, string>> { return this.root.attributes; }
  get width(): number { return this.canvasWidth; }
  get height(): number { return this.canvasHeight; }
  get viewBox(): string { return this.viewport; }
  get children(): readonly Shape[] { return this.root.children; }
  clone(): SvgDocument { return new SvgDocument(this.width, this.height, this.root.clone(), this.viewBox); }
  resize(width: number, height: number): void {
    Value.positive(width, 'width'); Value.positive(height, 'height');
    this.canvasWidth = width; this.canvasHeight = height;
    this.viewport = `0 0 ${width} ${height}`;
  }
  all(): readonly Shape[] {
    const result: Shape[] = [];
    const visit = (shape: Shape): void => { result.push(shape); shape.children.forEach(visit); };
    this.children.forEach(visit);
    return result;
  }
  find(id: string): Shape {
    const shape = this.all().find(item => item.id === id);
    if (!shape) throw new Error(`no such shape: ${id}`);
    return shape;
  }
  container(id?: string): Shape {
    if (id === undefined) return this.root;
    const shape = this.all().find(item => item.id === id);
    if (!shape) throw new Error(`no such container: ${id}`);
    if (!shape.isContainer) throw new Error(`not a container: ${id}`);
    return shape;
  }
  parent(shape: Shape): Shape {
    return [this.root, ...this.all()].find(item => item.children.includes(shape))!;
  }
  parentLabel(shape: Shape): string {
    const parent = this.parent(shape);
    return parent === this.root ? 'svg' : parent.label;
  }
  ensureAvailable(id: string): void {
    Value.id(id);
    if (this.all().some(shape => shape.id === id)) throw new Error(`id already exists: ${id}`);
  }
  add(shape: Shape, parentId?: string): void {
    this.ensureAvailable(shape.id);
    this.container(parentId).append(shape);
  }
  delete(id: string): Shape {
    const shape = this.find(id);
    this.parent(shape).remove(shape);
    return shape;
  }
  group(id: string, ids: readonly string[]): Group {
    this.ensureAvailable(id);
    if (ids.length === 0) throw new Error('group requires at least one shape');
    if (new Set(ids).size !== ids.length) throw new Error('duplicate group member');
    const selected = ids.map(member => this.find(member));
    for (const shape of selected) {
      if (selected.some(other => other !== shape && shape.contains(other.id))) {
        throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
      }
    }
    // Preserve document order, including when inputs come from different parents.
    const ordered = this.all().filter(shape => selected.includes(shape));
    const parents = ordered.map(shape => this.parent(shape));
    const parent = parents.every(item => item === parents[0]) ? parents[0]! : this.root;
    const index = parent === parents[0] ? parent.children.indexOf(ordered[0]!) : parent.children.length;
    const group = new Group(id);
    ordered.forEach(shape => { this.parent(shape).remove(shape); group.append(shape); });
    parent.append(group, index);
    return group;
  }
  ungroup(id: string): void {
    const group = this.container(id);
    const parent = this.parent(group);
    if (parent === this.root) throw new Error(`cannot ungroup top-level container: ${id}`);
    const index = parent.children.indexOf(group);
    const children = group.children;
    parent.remove(group);
    children.forEach((child, offset) => { group.remove(child); parent.append(child, index + offset); });
  }
  addTo(gid: string, id: string): void {
    const target = this.container(gid);
    const shape = this.find(id);
    if (shape.contains(gid)) throw new Error(`cannot move a container into its own descendant: ${id}`);
    this.parent(shape).remove(shape);
    target.append(shape);
  }
  reorder(id: string, front: boolean): void {
    const shape = this.find(id);
    const parent = this.parent(shape);
    parent.remove(shape);
    parent.append(shape, front ? parent.children.length : 0);
  }
}
