import test from 'node:test';
import assert from 'node:assert/strict';
import { findFormattingIssues } from './format-check.mjs';

test('format check accepts clean source lines', () => {
  assert.deepEqual(findFormattingIssues('const value = 1;\n'), []);
});

test('format check reports trailing whitespace with one-based lines', () => {
  assert.deepEqual(findFormattingIssues('clean\nnot clean  \n'), [2]);
});
