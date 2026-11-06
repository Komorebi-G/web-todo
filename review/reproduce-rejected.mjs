// 在临时副本应用审查反例；正式源码与测试都保持原样。
import { cpSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const folder = mkdtempSync(join(tmpdir(), 'web-w10-rejected-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(command, args) {
  const result = spawnSync(command, args, { cwd: folder, stdio: 'inherit' });
  if (result.error) throw result.error;
  return result.status;
}

try {
  for (const file of ['src', 'tests', 'package.json', 'tsconfig.json', '.eslintrc.cjs']) {
    cpSync(join(root, file), join(folder, file), { recursive: true });
  }
  symlinkSync(resolve(root, 'node_modules'), join(folder, 'node_modules'), 'junction');
  if (run('git', ['apply', join(root, 'review/rejected-remove-trim.patch')]) !== 0) {
    throw new Error('Could not apply the review patch');
  }
  console.log('REVIEW COUNTEREXAMPLE: removed item.text.trim() !== ""');
  console.log('$ npx eslint src/ -f ./review/eslint-summary.cjs');
  const lint = run(npm, ['exec', '--', 'eslint', 'src/', '-f', join(root, 'review/eslint-summary.cjs')]);
  console.log('$ npx vitest run tests/storage.test.ts -t "rejects whitespace-only saved text"');
  const test = run(npm, ['exec', '--', 'vitest', 'run', 'tests/storage.test.ts', '-t', 'rejects whitespace-only saved text']);
  console.log(`ESLint exit=${lint}; Vitest exit=${test}`);
  if (lint !== 0 || test !== 1) throw new Error('Expected lint success and a failing business test');
  console.log('Counterexample confirmed. Production src/ was not changed.');
} finally {
  rmSync(folder, { recursive: true, force: true });
}
