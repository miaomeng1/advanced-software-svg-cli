import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ShapeFactory } from '../src/domain/ShapeFactory.js';
import { SvgDocument } from '../src/domain/SvgDocument.js';

const factory = new ShapeFactory();
test('six built-in shapes support polymorphic copy, move and scale', () => {
  const cases = [ ['rect', ['1','2','3','4']], ['circle', ['1','2','3']], ['ellipse', ['1','2','3','4']],
    ['line', ['1','2','3','4']], ['text', ['1','2','hello']], ['g', []] ] as const;
  for (const [type, args] of cases) {
    const shape = factory.create(type, type, args);
    const copy = shape.clone();
    copy.move(10, 20); copy.scale(2);
    assert.equal(shape.id, copy.id);
    if (!shape.isContainer) assert.notDeepEqual(shape.attributes, copy.attributes);
  }
});
test('nested Composite operations reach descendants exactly once', () => {
  const doc = new SvgDocument();
  doc.add(factory.create('g', 'scene', []));
  doc.add(factory.create('g', 'node', []), 'scene');
  doc.add(factory.create('rect', 'r', ['1','2','3','4']), 'node');
  doc.find('scene').move(10, 20); doc.find('scene').scale(2);
  assert.deepEqual(doc.find('r').attributes, { x:'22', y:'44', width:'6', height:'8' });
});
test('group preserves document order and guards ancestry; ungroup guards root', () => {
  const doc = new SvgDocument();
  doc.add(factory.create('g', 'scene', []));
  for (const id of ['a','b','c']) doc.add(factory.create('circle', id, ['1','2','3']), 'scene');
  doc.group('pair', ['c','a']);
  assert.deepEqual(doc.find('pair').children.map(shape => shape.id), ['a','c']);
  assert.throws(() => doc.group('bad', ['scene','a']), /cannot group a container/);
  doc.ungroup('pair');
  assert.deepEqual(doc.find('scene').children.map(shape => shape.id), ['a','c','b']);
  assert.throws(() => doc.ungroup('scene'), /top-level/);
  assert.throws(() => doc.addTo('scene', 'scene'), /own descendant/);
});
test('unknown types, attributes and invalid geometry are rejected', () => {
  assert.throws(() => factory.create('box','x',[]), /unknown shape type/);
  const shape = factory.create('rect','r',['0','0','1','2']);
  assert.throws(() => shape.set('width','-1'), /nonnegative/);
  assert.throws(() => shape.set('id','x'), /unknown attribute/);
  assert.throws(() => shape.scale(0), /positive/);
});
