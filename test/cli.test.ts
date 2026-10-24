import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SvgCodec } from '../src/infrastructure/SvgCodec.js';
import { Tokenizer } from '../src/cli/Tokenizer.js';

test('CLI replays assignment flowchart and saves a browser-readable SVG', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'svg-replay-'));
  try {
    const output = join(directory, 'flowchart.svg');
    const commands = (await readFile('examples/flowchart.commands', 'utf8')).replace('save flowchart.svg', `save "${output}"`);
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/main.ts'], { input: commands, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.match(result.stdout, /saved to .* \(8 elements\)/);
    assert.doesNotMatch(result.stdout, /error:|svg> /);
    const document = new SvgCodec().decode(await readFile(output, 'utf8')).document;
    assert.equal(document.all().length, 8);
    assert.equal(document.find('process-label').text, '处理数据 v2');
    assert.equal(document.find('process').attributes.y, '100');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('CLI continues after errors and gives scripts a nonzero exit status', () => {
  const result = spawnSync(process.execPath, ['--import','tsx','src/main.ts'], {
    input: 'init\ncreate g scene\nunknown\ntree\n', encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /error: unknown command: unknown/);
  assert.match(result.stdout, /└── g#scene/);
});
test('tokenizer keeps quoted suffixes, backslashes, escaped quotes and colors', () => {
  const tokens = new Tokenizer().parse('create text t 0 0 "say \\"hello\\" \\\\ world"');
  assert.equal(tokens.at(-1)!.value, 'say "hello" \\ world');
  assert.deepEqual(new Tokenizer().parse('set r fill #abc').map(token => token.value), ['set','r','fill','#abc']);
  assert.equal(new Tokenizer().parse('create text t 0 "in" "root"')[4]!.quoted, true);
});
