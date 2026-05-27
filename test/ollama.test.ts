import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getOllamaBaseUrl } from '../src/modules/ollama.js';

const original = process.env.OLLAMA_HOST;

afterEach(() => {
  if (original === undefined) {
    delete process.env.OLLAMA_HOST;
  } else {
    process.env.OLLAMA_HOST = original;
  }
});

test('defaults to localhost:11434 when OLLAMA_HOST is unset', () => {
  delete process.env.OLLAMA_HOST;
  assert.equal(getOllamaBaseUrl(), 'http://localhost:11434');
});

test('accepts a full URL', () => {
  process.env.OLLAMA_HOST = 'http://192.168.1.10:11434';
  assert.equal(getOllamaBaseUrl(), 'http://192.168.1.10:11434');
});

test('adds scheme when missing', () => {
  process.env.OLLAMA_HOST = '127.0.0.1:11434';
  assert.equal(getOllamaBaseUrl(), 'http://127.0.0.1:11434');
});

test('defaults the port when only a host is given', () => {
  process.env.OLLAMA_HOST = 'my-ollama-host';
  assert.equal(getOllamaBaseUrl(), 'http://my-ollama-host:11434');
});
