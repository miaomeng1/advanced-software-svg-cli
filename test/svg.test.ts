import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SvgCodec } from '../src/infrastructure/SvgCodec.js';
import { FileDocumentStore } from '../src/infrastructure/FileDocumentStore.js';
import { Editor } from '../src/application/Editor.js';
import { CommandRunner } from '../src/cli/CommandRunner.js';

const codec = new SvgCodec();
const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">${body}</svg>`;
test('assignment fixture imports seven shapes and reports assigned id', async () => {
  const { document, warnings } = codec.decode(await readFile('fixtures/other.svg', 'utf8'));
  assert.equal(document.all().length, 7);
  assert.deepEqual(warnings, ['warning: assigned id rect1 to unnamed <rect>']);
  assert.equal(document.find('t1').text, 'imported');
});
test('auto ids avoid explicit ids anywhere in the document and stay case-sensitive', () => {
  const { document, warnings } = codec.decode(svg('<rect/><g><rect id="rect1"/><rect/></g><rect id="Rect1"/>'));
  assert.deepEqual(document.all().map(shape => shape.id), ['rect2','g1','rect1','rect3','Rect1']);
  assert.equal(warnings.length, 3);
  assert.throws(() => codec.decode(svg('<g id="a"><rect id="a"/></g>')), /id already exists: a/);
});
test('all geometry, nesting, XML characters and whitespace survive round trip', () => {
  const source = svg('<g id="scene" fill="red"><rect id="r" x="1.25" y="-2" width="3" height="4"/>' +
    '<circle id="c" cx="2" cy="3" r="4"/><ellipse id="e" cx="1" cy="2" rx="3" ry="4"/>' +
    '<line id="l" x1="1" y1="2" x2="3" y2="4" stroke="black"/>' +
    '<text id="t" x="1" y="2" font-size="16" text-anchor="middle">  中文 &amp; &lt;hello&gt; "世界"  </text></g>');
  const first = codec.decode(source).document;
  const output = codec.encode(first);
  const second = codec.decode(output).document;
  assert.equal(codec.encode(second), output);
  assert.equal(second.find('t').text, '  中文 & <hello> "世界"  ');
  assert.equal(second.find('t').attributes['font-size'], '16');
  assert.equal(second.find('r').attributes.fill, undefined);
});
test('empty text, prefixed namespace and root style preserve supported semantics', () => {
  const source = '<s:svg xmlns:s="http://www.w3.org/2000/svg" width="400px" height="300" viewBox="10 20 200 150" fill="blue"><s:text id="t"/></s:svg>';
  const document = codec.decode(source).document;
  const copy = codec.decode(codec.encode(document)).document;
  assert.equal(copy.find('t').text, '');
  assert.equal(copy.viewBox, '10 20 200 150');
  assert.equal(copy.attributes.fill, 'blue');
});
test('malformed XML, unsupported shapes and invalid geometry do not silently disappear', () => {
  for (const source of ['<svg><g></svg>', '<not-svg/>', svg('<path id="p"/>'),
    svg('<rect id="r" width="-1"/>'), svg('<rect id="r" x="NaN"/>'),
    svg('<text id="t"><tspan>x</tspan></text>'), svg('<g id="g">unexpected</g>'),
    '<!DOCTYPE svg [<!ENTITY x "value">]><svg/>',
    svg('<g id="g" onclick="alert(1)"/>'), svg('<g id="g" transform="rotate(30)"/>')]) {
    assert.throws(() => codec.decode(source), source);
  }
});
test('translate and uniform scale normalize recursively in SVG order', () => {
  const document = codec.decode(svg('<g id="g" transform="translate(60,40)">' +
    '<g id="b" transform="translate(200,0) scale(0.8)"><rect id="r" x="0" y="0" width="120" height="60"/></g></g>')).document;
  assert.deepEqual(document.find('r').attributes, { x:'260', y:'40', width:'96', height:'48' });
  assert.equal(document.find('b').attributes.transform, undefined);
  document.find('g').move(10, 20);
  assert.equal(document.find('r').attributes.x, '270');
});
test('file save is readable, no-argument save remembers path, and temporary files are cleaned', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'svg-editor-'));
  try {
    const file = join(directory, 'a & b.svg');
    const runner = new CommandRunner(new Editor(new FileDocumentStore()));
    await runner.run('init 400 300'); await runner.run('create text t 1 2 "A & B < C"');
    assert.match((await runner.run(`save "${file}"`))[0]!, /^saved to/);
    await runner.run('set t text "changed"'); await runner.run('save');
    assert.equal(codec.decode(await readFile(file, 'utf8')).document.find('t').text, 'changed');
    assert.deepEqual(await readdir(directory), ['a & b.svg']);
    await runner.run('init'); await runner.run(`read "${file}"`);
    assert.match((await runner.run('show t')).join('\n'), /changed/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('invalid reads and failed writes preserve active document and undo history', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'svg-errors-'));
  try {
    const broken = join(directory, 'broken.svg');
    await writeFile(broken, svg('<rect/><rect id="x"/><g id="x"/>'));
    const runner = new CommandRunner(new Editor(new FileDocumentStore()));
    await runner.run('init'); await runner.run('create g kept');
    const before = await runner.run('tree');
    assert.deepEqual(await runner.run(`read ${broken}`), ['error: id already exists: x']);
    assert.deepEqual(await runner.run('tree'), before);
    assert.match((await runner.run(`save ${directory}`))[0]!, /^error: cannot write file:/);
    assert.deepEqual(await runner.run('tree'), before);
    assert.match((await runner.run('undo'))[0]!, /^undone:/);
    assert.deepEqual(await readdir(directory), ['broken.svg']);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('internal root identity never reserves a user id', () => {
  const document = codec.decode(svg('<g id="__root__"><rect id="r"/></g>')).document;
  assert.equal(document.find('__root__').isContainer, true);
  assert.equal(document.clone().all().length, 2);
});
test('unknown data-kind is retained but downgraded to an ordinary group', () => {
  const document = codec.decode(svg('<g id="scene"><g id="box" data-kind="box"><rect id="r"/></g></g>')).document;
  document.ungroup('box');
  assert.equal(document.find('scene').children[0]!.id, 'r');
});
