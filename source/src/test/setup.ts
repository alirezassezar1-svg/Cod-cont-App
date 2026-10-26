import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import Prism from '../utils/prism-init';

// Ensure Prism is globally available across all JSDOM test workers
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Prism = Prism;
}

// Automatically clean up DOM after each test run
afterEach(() => {
  cleanup();
});
