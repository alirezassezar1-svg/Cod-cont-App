import { describe, it, expect } from 'vitest';
import { highlightCode, getPrismLanguage } from './syntax-highlighter';

describe('syntax-highlighter', () => {
  it('identifies correct prism language aliases from file extensions or names', () => {
    expect(getPrismLanguage('App.tsx')).toBe('tsx');
    expect(getPrismLanguage('App.vue')).toBe('markup');
    expect(getPrismLanguage('Component.svelte')).toBe('markup');
    expect(getPrismLanguage('style.css')).toBe('css');
    expect(getPrismLanguage('package.json')).toBe('json');
    expect(getPrismLanguage('unknown-file')).toBe('javascript');
  });

  it('highlights TypeScript/JavaScript code into formatted HTML spans', () => {
    const raw = `const greeting: string = "Hello World";`;
    const highlighted = highlightCode(raw, 'typescript');
    expect(highlighted).toContain('<span class="token');
    expect(highlighted).toContain('greeting');
  });

  it('safely handles empty strings', () => {
    const result = highlightCode('', 'typescript');
    expect(result).toBe('');
  });
});
