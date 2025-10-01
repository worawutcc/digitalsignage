/**
 * Polyfill for 'self' global in Node.js server-side rendering
 * This is required because some third-party packages assume browser environment
 */

if (typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis
}
