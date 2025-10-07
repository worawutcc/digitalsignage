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

// Mock lucide-react icons (ESM) with a simple SVG component to avoid transform/runtime issues
jest.mock('lucide-react', () => {
  const React = require('react')
  const Icon = (props) => React.createElement('svg', props)

  // Return a proxy so any named export yields the Icon component
  const proxy = new Proxy({ __esModule: true, default: Icon }, {
    get: (target, prop) => {
      if (prop in target) return target[prop]
      return Icon
    }
  })

  return proxy
})

// Mock @/lib/api to prevent apiClient initialization errors during test imports
jest.mock('@/lib/api', () => {
  const mockApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
  }

  return {
    apiClient: mockApiClient,
    api: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      upload: jest.fn(),
    },
    ApiError: class ApiError extends Error {
      constructor(status, data, message, code) {
        super(message)
        this.status = status
        this.data = data
        this.code = code
        this.name = 'ApiError'
      }
    },
  }
})

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

// Minimal TransformStream stub for environments where it's not available (undici/msw)
if (typeof global.TransformStream === 'undefined') {
  class _TransformStream {
    constructor() {
      this.readable = new ReadableStream({
        start() {},
      })
      this.writable = {
        getWriter: () => ({
          write: async () => {},
          close: async () => {},
        }),
      }
    }
  }
  global.TransformStream = _TransformStream
}

// Polyfill for fetch API (needed for MSW)
const { fetch, Request, Response, Headers } = require('undici')
Object.assign(global, { fetch, Request, Response, Headers })

// Polyfill for BroadcastChannel used by some libraries (msw websocket internals)
class MockBroadcastChannel {
  constructor(name) {
    this.name = name
    this._listeners = new Set()
  }
  postMessage(msg) {
    // no-op in tests
  }
  addEventListener(type, cb) {
    if (type === 'message') this._listeners.add(cb)
  }
  removeEventListener(type, cb) {
    if (type === 'message') this._listeners.delete(cb)
  }
  close() {
    this._listeners.clear()
  }
}

global.BroadcastChannel = global.BroadcastChannel || MockBroadcastChannel

// Stub for performance.markResourceTiming used by undici in JSDOM env
if (!global.performance) global.performance = {}
global.performance.markResourceTiming = global.performance.markResourceTiming || function () {}