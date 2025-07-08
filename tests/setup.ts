// Test setup file
// This file runs before each test

// Mock crypto.subtle for tests
if (typeof global !== 'undefined' && !global.crypto) {
  (global as any).crypto = {
    subtle: {
      digest: async (algorithm: string, data: Uint8Array) => {
        // Simple mock implementation
        return new ArrayBuffer(32);
      },
    },
  };
}

// Mock fetch if not available
if (typeof global !== 'undefined' && !global.fetch) {
  (global as any).fetch = jest.fn();
}