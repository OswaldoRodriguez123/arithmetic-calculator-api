import bcrypt from 'bcryptjs';
import { compareHash } from './common';

describe('compareHash', () => {
  test('returns true for a matching password', () => {
    const hash = bcrypt.hashSync('secret123', 4);
    expect(compareHash('secret123', hash)).toBe(true);
  });

  test('returns false for a non-matching password', () => {
    const hash = bcrypt.hashSync('secret123', 4);
    expect(compareHash('nope', hash)).toBe(false);
  });

  test('returns false instead of throwing for a non-string password', () => {
    const hash = bcrypt.hashSync('secret123', 4);
    // @ts-expect-error - runtime validation for untrusted input
    expect(compareHash({ x: 1 }, hash)).toBe(false);
  });
});
