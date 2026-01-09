import { describe, it, expect } from 'vitest';

describe('Frontend', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should have correct environment', () => {
    expect(import.meta.env).toBeDefined();
  });
});
