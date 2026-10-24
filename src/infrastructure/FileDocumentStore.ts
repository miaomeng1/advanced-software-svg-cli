import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { basename, dirname, join } from 'node:path';
import type { DocumentStore } from '../application/ports/DocumentStore.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import { SvgCodec } from './SvgCodec.js';

export class FileDocumentStore implements DocumentStore {
  constructor(private readonly codec = new SvgCodec()) {}
  async read(path: string): Promise<{ document: SvgDocument; warnings: readonly string[] }> {
    let source: string;
    try { source = await readFile(path, 'utf8'); }
    catch { throw new Error(`cannot read file: ${path}`); }
    // Parse errors remain informative; the Editor commits only after full validation.
    return this.codec.decode(source);
  }
  async write(path: string, document: SvgDocument): Promise<void> {
    const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, this.codec.encode(document), { encoding: 'utf8', flag: 'wx' });
      await rename(temporary, path);
    } catch {
      throw new Error(`cannot write file: ${path}`);
    } finally {
      await rm(temporary, { force: true }).catch(() => undefined);
    }
  }
}
