import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Editor } from '../src/application/Editor.js';
import { CommandRunner } from '../src/cli/CommandRunner.js';
import { MemoryStore } from './MemoryStore.js';

const setup = async () => {
  const editor = new Editor(new MemoryStore());
  const runner = new CommandRunner(editor);
  await runner.run('init');
  return { editor, run: (line: string) => runner.run(line) };
};

test('no document errors and help before init', async () => {
  const runner = new CommandRunner(new Editor(new MemoryStore()));
  for (const command of ['tree', 'save', 'canvas', 'undo', 'redo', 'create g a']) {
    assert.deepEqual(await runner.run(command), ["error: no document. use 'init' or 'read' first"]);
  }
  assert.ok((await runner.run('help')).includes('init [w] [h]'));
});
test('quoted text, empty strings, hex colors, comments and in suffix', async () => {
  const { editor, run } = await setup();
  await run('create g root');
  await run('create text label 1 2 "hello world" in root');
  await run('create rect r 0 0 10 20 #ffffff in root');
  assert.equal(editor.document.find('label').text, 'hello world');
  assert.equal(editor.document.find('r').attributes.fill, '#ffffff');
  assert.deepEqual(await run(' # comment'), []);
  await run('set label text ""');
  assert.equal(editor.document.find('label').text, '');
  await run('create text in-label 1 2 "in"');
  assert.equal(editor.document.find('in-label').text, 'in');
  assert.match((await run('set label text "broken'))[0]!, /^error: unterminated/);
});
test('each edit is one undo unit and a new edit clears redo', async () => {
  const { editor, run } = await setup();
  await run('create rect a 0 0 10 20'); await run('create circle b 5 6 7');
  const before = await run('tree');
  await run('group pair b a'); await run('undo');
  assert.deepEqual(await run('tree'), before);
  await run('redo');
  assert.deepEqual(editor.document.find('pair').children.map(shape => shape.id), ['a','b']);
  await run('undo'); await run('move a 1 2');
  assert.deepEqual(await run('redo'), ['error: nothing to redo']);
});
test('failed edit preserves document and redo stack', async () => {
  const { run } = await setup();
  await run('create g scene'); await run('create rect a 0 0 10 20 in scene');
  await run('move a 1 2'); await run('undo');
  const before = await run('tree');
  for (const command of ['group bad scene a', 'addto scene scene', 'set a width -1', 'create g a',
    'create rect bad 1 2 3 4 in missing', 'create g child in a', 'scale scene 0']) {
    assert.match((await run(command))[0]!, /^error:/);
    assert.deepEqual(await run('tree'), before);
  }
  assert.match((await run('redo'))[0]!, /^redone:/);
});
test('failed recursive edit rolls back even when an earlier child was changed', async () => {
  const { run } = await setup();
  await run('create g scene');
  await run('create circle small 1 2 3 in scene');
  await run('create circle huge 1e308 2 3 in scene');
  const before = await run('tree');
  assert.match((await run('scale scene 2'))[0]!, /^error: invalid number/);
  assert.deepEqual(await run('tree'), before);
});
test('document commands establish barriers; display commands do not', async () => {
  const { run } = await setup();
  assert.deepEqual(await run('undo'), ['error: undo not allowed after io command']);
  await run('create g a'); await run('canvas'); await run('show a'); await run('tree'); await run('help');
  assert.match((await run('undo'))[0]!, /^undone:/);
  await run('redo'); await run('save saved.svg');
  assert.deepEqual(await run('redo'), ['error: undo not allowed after io command']);
  await run('create g b'); await run('canvas 100 200');
  assert.deepEqual(await run('undo'), ['error: undo not allowed after io command']);
  await run('create g c'); await run('read saved.svg');
  assert.deepEqual(await run('undo'), ['error: undo not allowed after io command']);
  await run('create g d'); await run('init');
  assert.deepEqual(await run('undo'), ['error: undo not allowed after io command']);
});
test('failed I/O preserves document, history and last path', async () => {
  const { run } = await setup();
  await run('create g a'); await run('save good.svg'); await run('create g b');
  const before = await run('tree');
  for (const command of ['save unwritable.svg','read missing.svg','init -1 2','canvas -1 2']) {
    assert.match((await run(command))[0]!, /^error:/);
    assert.deepEqual(await run('tree'), before);
  }
  assert.match((await run('undo'))[0]!, /^undone:/);
  assert.match((await run('save'))[0]!, /^saved to good.svg/);
});
test('nested ungroup, delete subtree, z-order and addto are reversible', async () => {
  const { run } = await setup();
  await run('create g scene'); await run('create g node in scene');
  await run('create circle a 1 2 3 in node'); await run('create g other in scene');
  for (const command of ['ungroup node', 'delete node', 'front node', 'back other', 'addto other a',
    'move scene .5 -.25', 'scale scene 2', 'set scene fill red']) {
    const before = await run('tree');
    assert.doesNotMatch((await run(command))[0]!, /^error:/);
    await run('undo'); assert.deepEqual(await run('tree'), before);
  }
});
test('strict arity, numbers and expected errors', async () => {
  const { run } = await setup();
  await run('create rect r 1 2 3 4');
  const cases: [string, string][] = [
    ['create box b', 'unknown shape type: box (is the plugin loaded?)'],
    ['move missing 1 2', 'no such shape: missing'],
    ['create g r', 'id already exists: r'],
    ['create g a in missing', 'no such container: missing'],
    ['create g a in r', 'not a container: r'],
    ['set r nonsense 1', 'unknown attribute: nonsense'],
    ['scale r -1', 'scale factor must be positive'],
  ];
  for (const [input, error] of cases) assert.deepEqual(await run(input), [`error: ${error}`]);
  for (const input of ['move r NaN 1','move r 0x10 1','move r "" 1','canvas 1','undo extra','set r x 1 extra']) {
    assert.match((await run(input))[0]!, /^error:/);
  }
});
