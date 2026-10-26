/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Prism from './prism-init';

// Import essential Prism language definitions in strict dependency order
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-tsx.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-markup-templating.js';
import 'prismjs/components/prism-php.js';

/**
 * Normalizes language identifier for Prism, inspecting either explicit language or filePath
 */
export function getPrismLanguage(lang: string, filePath?: string): string {
  const target = (filePath || (lang.includes('.') ? lang : '')).toLowerCase();
  if (target) {
    if (target.endsWith('.tsx')) return 'tsx';
    if (target.endsWith('.jsx')) return 'jsx';
    if (target.endsWith('.ts')) return 'typescript';
    if (
      target.endsWith('.vue') ||
      target.endsWith('.svelte') ||
      target.endsWith('.html') ||
      target.endsWith('.blade.php')
    ) {
      return 'markup';
    }
    if (target.endsWith('.css')) return 'css';
    if (target.endsWith('.php')) return 'php';
    if (target.endsWith('.json')) return 'json';
    if (target.endsWith('.sh') || target.endsWith('.bash')) return 'bash';
  }

  const normalized = lang.toLowerCase();
  switch (normalized) {
    case 'typescript':
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'tsx';
    case 'jsx':
      return 'jsx';
    case 'javascript':
    case 'js':
      return 'javascript';
    case 'css':
      return 'css';
    case 'vue':
    case 'svelte':
    case 'html':
    case 'markup':
      return 'markup';
    case 'php':
    case 'blade':
      return 'php';
    case 'json':
      return 'json';
    case 'bash':
    case 'sh':
      return 'bash';
    default:
      return 'javascript';
  }
}

/**
 * Highlights a string of code into HTML tokens safely
 */
export function highlightCode(code: string, language: string, filePath?: string): string {
  if (!code) return '';

  try {
    const prismLang = getPrismLanguage(language, filePath);
    const grammar = Prism.languages[prismLang] || Prism.languages.javascript;
    if (grammar) {
      return Prism.highlight(code, grammar, prismLang);
    }
  } catch (err) {
    // Fall through to escaping
  }

  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
