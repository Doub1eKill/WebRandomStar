import { describe, it, expect } from 'vitest';

describe('Project Environment Setup', () => {
  it('should run tests in happy-dom environment successfully', () => {
    expect(1 + 1).toBe(2);
    expect(document).toBeDefined();
  });
});
