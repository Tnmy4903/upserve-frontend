import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const extensions = new Set(['.css', '.ts', '.tsx']);

export async function collectSourceFiles(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectSourceFiles(target));
    else if (extensions.has(path.extname(entry.name))) files.push(target);
  }
  return files;
}

export function findFormattingIssues(content) {
  return content.split(/\r?\n/).flatMap((line, index) => /[ \t]+$/.test(line) ? [index + 1] : []);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = await collectSourceFiles();
  const issues = [];
  for (const file of files) {
    const lines = findFormattingIssues(await readFile(file, 'utf8'));
    if (lines.length) issues.push(`${path.relative(process.cwd(), file)}: trailing whitespace on line(s) ${lines.join(', ')}`);
  }
  if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
  else console.log(`Format check passed for ${files.length} source files.`);
}
