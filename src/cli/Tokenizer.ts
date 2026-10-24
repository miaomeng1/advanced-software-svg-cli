import type { Token } from '../application/Token.js';

export class Tokenizer {
  parse(line: string): readonly Token[] {
    if (line.trimStart().startsWith('#')) return [];
    const result: Token[] = [];
    let value = '', inQuotes = false, quoted = false, started = false;
    for (let index = 0; index < line.length; index++) {
      const char = line[index]!;
      if (char === '"') { inQuotes = !inQuotes; quoted = true; started = true; }
      else if (inQuotes && char === '\\' && ['"', '\\'].includes(line[index + 1] ?? '')) {
        value += line[++index];
      } else if (!inQuotes && /\s/u.test(char)) {
        if (started) { result.push({ value, quoted }); value = ''; quoted = false; started = false; }
      } else { value += char; started = true; }
    }
    if (inQuotes) throw new Error('unterminated double quote');
    if (started) result.push({ value, quoted });
    return result;
  }
}
