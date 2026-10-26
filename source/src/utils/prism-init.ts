/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Prism from 'prismjs';

// Ensure Prism is on global scope for Prism component extensions
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Prism = Prism;
}
if (typeof window !== 'undefined') {
  (window as any).Prism = Prism;
}

export default Prism;
