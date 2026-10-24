import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const files = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(join(directory, entry.name)) : Promise.resolve([join(directory, entry.name)])))).flat();
};

test('production classes follow one class per matching file', async () => {
  for (const file of await files('src')) {
    const source = ts.createSourceFile(file, await readFile(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const classes = source.statements.filter(ts.isClassDeclaration);
    assert.ok(classes.length <= 1, file);
    if (classes.length) assert.equal(classes[0]!.name?.text, basename(file, '.ts'), file);
  }
});
test('imports obey documented dependency directions', async () => {
  const allowed: Readonly<Record<string, readonly string[]>> = {
    domain: ['domain'], application: ['application','domain'],
    infrastructure: ['infrastructure','application','domain'], cli: ['cli','application'],
  };
  for (const file of await files('src')) {
    const layer = relative('src', file).split('/')[0]!;
    if (layer === 'main.ts') continue;
    const source = ts.createSourceFile(file, await readFile(file, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const statement of source.statements.filter(ts.isImportDeclaration)) {
      const path = (statement.moduleSpecifier as ts.StringLiteral).text;
      if (!path.startsWith('.')) {
        if (['domain','application'].includes(layer)) assert.fail(`${file} must not depend on ${path}`);
        continue;
      }
      const target = relative(resolve('src'), resolve(file, '..', path)).split('/')[0]!;
      assert.ok(allowed[layer]?.includes(target), `${file} -> ${path}`);
    }
  }
});
test('shape behavior is polymorphic, with no switch-based type dispatch', async () => {
  for (const file of await files('src')) {
    const source = ts.createSourceFile(file, await readFile(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      assert.ok(!ts.isSwitchStatement(node), `unexpected switch in ${file}`);
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
});
