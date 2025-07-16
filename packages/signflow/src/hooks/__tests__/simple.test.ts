import { describe, it, expect } from 'vitest';

describe('Simple Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('should test basic functionality', () => {
    const testData = { name: 'SignFlow', version: '0.1.0' };
    expect(testData.name).toBe('SignFlow');
    expect(testData.version).toBe('0.1.0');
  });
});