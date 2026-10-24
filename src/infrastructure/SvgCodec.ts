import { DOMImplementation, DOMParser, XMLSerializer } from '@xmldom/xmldom';
import type { Element, Document as XmlDocument } from '@xmldom/xmldom';
import { Group } from '../domain/Group.js';
import { ShapeFactory } from '../domain/ShapeFactory.js';
import { SvgDocument } from '../domain/SvgDocument.js';
import type { Shape } from '../domain/Shape.js';
import { Value } from '../domain/Value.js';
import { SvgTransform } from './SvgTransform.js';

export class SvgCodec {
  private readonly namespace = 'http://www.w3.org/2000/svg';
  constructor(private readonly factory = new ShapeFactory()) {}
  decode(source: string): { document: SvgDocument; warnings: readonly string[] } {
    if (/<!DOCTYPE/i.test(source)) throw new Error('unsupported SVG: DOCTYPE is not allowed');
    const xml = new DOMParser({ onError: (_level, message) => { throw new Error(message); } })
      .parseFromString(source, 'image/svg+xml');
    const root = xml.documentElement;
    if (!root || root.localName !== 'svg') throw new Error('invalid SVG: expected <svg> root');
    const elements = [root, ...Array.from(root.getElementsByTagName('*'))];
    const used = new Set<string>();
    // Reserve every explicit id before assigning any missing ids, including later siblings.
    for (const element of elements) {
      if (element.namespaceURI && element.namespaceURI !== this.namespace) throw new Error('unsupported SVG namespace');
      const id = element.getAttribute('id');
      if (id) {
        Value.id(id);
        if (used.has(id)) throw new Error(`id already exists: ${id}`);
        used.add(id);
      }
    }
    const warnings: string[] = [];
    const counters = new Map<string, number>();
    const parse = (element: Element): Shape => {
      const tag = element.localName ?? element.tagName;
      let id = element.getAttribute('id');
      if (!id) {
        let count = counters.get(tag) ?? 0;
        do { id = `${tag}${++count}`; } while (used.has(id));
        counters.set(tag, count); used.add(id);
        warnings.push(`warning: assigned id ${id} to unnamed <${tag}>`);
      }
      const shape = this.factory.empty(tag, id);
      const attrs = this.attributes(element);
      const transform = attrs.transform;
      delete attrs.transform;
      shape.importAttributes(attrs);
      const children = this.elements(element);
      if (shape.text !== undefined) {
        if (children.length) throw new Error('unsupported child element inside <text>');
        shape.set('text', element.textContent ?? '');
      } else {
        this.validateContent(element);
        children.forEach(child => shape.append(parse(child)));
      }
      if (transform) new SvgTransform(transform).apply(shape);
      return shape;
    };
    const attrs = this.attributes(root);
    const viewBox = attrs.viewBox;
    const view = viewBox?.trim().split(/[\s,]+/).map(value => Value.number(value));
    if (view && (view.length !== 4 || view[2]! <= 0 || view[3]! <= 0)) throw new Error('invalid SVG viewBox');
    const width = this.dimension(attrs.width, view?.[2] ?? 800);
    const height = this.dimension(attrs.height, view?.[3] ?? 600);
    const group = new Group('__root__', true);
    for (const key of ['width', 'height', 'viewBox', 'version']) delete attrs[key];
    // Root transforms are outside this phase's normalized group-transform subset.
    group.importAttributes(attrs);
    this.validateContent(root);
    this.elements(root).forEach(element => group.append(parse(element)));
    return { document: new SvgDocument(width, height, group, view?.join(' ')), warnings };
  }
  encode(document: SvgDocument): string {
    const xml = new DOMImplementation().createDocument(this.namespace, 'svg', null);
    const root = xml.documentElement!;
    root.setAttribute('xmlns', this.namespace);
    root.setAttribute('width', String(document.width));
    root.setAttribute('height', String(document.height));
    root.setAttribute('viewBox', document.viewBox);
    Object.entries(document.attributes).forEach(([key, value]) => root.setAttribute(key, value));
    document.children.forEach(shape => this.append(xml, root, shape, 1));
    if (document.children.length) root.appendChild(xml.createTextNode('\n'));
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(xml) + '\n';
  }
  private append(xml: XmlDocument, parent: Element, shape: Shape, depth: number): void {
    parent.appendChild(xml.createTextNode('\n' + '  '.repeat(depth)));
    const element = xml.createElementNS(this.namespace, shape.tag);
    element.setAttribute('id', shape.id);
    Object.entries(shape.attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (shape.text !== undefined) element.appendChild(xml.createTextNode(shape.text));
    shape.children.forEach(child => this.append(xml, element, child, depth + 1));
    if (shape.children.length) element.appendChild(xml.createTextNode('\n' + '  '.repeat(depth)));
    parent.appendChild(element);
  }
  private attributes(element: Element): Record<string, string> {
    return Object.fromEntries(Array.from(element.attributes).map(attr => [attr.name, attr.value]));
  }
  private elements(element: Element): readonly Element[] {
    return Array.from(element.childNodes).filter(node => node.nodeType === 1) as Element[];
  }
  private validateContent(element: Element): void {
    if (Array.from(element.childNodes).some(node => [3, 4].includes(node.nodeType) && node.nodeValue?.trim())) {
      throw new Error(`unexpected text inside <${element.localName}>`);
    }
  }
  private dimension(value: string | undefined, fallback: number): number {
    return value === undefined ? fallback : Value.positive(value.replace(/px$/, ''), 'canvas dimension');
  }
}
