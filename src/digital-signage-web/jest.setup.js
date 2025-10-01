import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5100'
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:5100/ws'

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// TextEncoder/TextDecoder polyfill for Node.js (needed for MSW)
const { TextDecoder, TextEncoder } = require('util')
Object.assign(global, { TextDecoder, TextEncoder })

// Polyfill for MessagePort (needed for undici/jest compatibility)
const { MessageChannel } = require('worker_threads')
global.MessagePort = MessageChannel.prototype.constructor
global.MessageChannel = MessageChannel

// Polyfill for ReadableStream (needed for MSW)
const { ReadableStream } = require('stream/web')
Object.assign(global, { ReadableStream })

// Polyfill for fetch API (needed for MSW)
const { fetch, Request, Response, Headers } = require('undici')
Object.assign(global, { fetch, Request, Response, Headers })