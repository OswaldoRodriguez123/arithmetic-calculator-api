import { getAllSchema } from './';

describe('getAllSchema', () => {
  test('accepts valid paging values', () => {
    expect(() => getAllSchema.parse({ page: '1', rowsPerPage: '10' })).not.toThrow();
    expect(() => getAllSchema.parse({ page: '9999', rowsPerPage: '100' })).not.toThrow();
  });

  test('rejects rowsPerPage above 100', () => {
    expect(() => getAllSchema.parse({ page: '1', rowsPerPage: '101' })).toThrow();
  });

  test('rejects rowsPerPage of 0', () => {
    expect(() => getAllSchema.parse({ page: '1', rowsPerPage: '0' })).toThrow();
  });

  test('rejects non-numeric and negative page values', () => {
    expect(() => getAllSchema.parse({ page: 'abc', rowsPerPage: '10' })).toThrow();
    expect(() => getAllSchema.parse({ page: '-1', rowsPerPage: '10' })).toThrow();
    expect(() => getAllSchema.parse({ page: '0', rowsPerPage: '10' })).toThrow();
    expect(() => getAllSchema.parse({ page: '1.5', rowsPerPage: '10' })).toThrow();
  });

  test('rejects search strings longer than 200 characters', () => {
    expect(() =>
      getAllSchema.parse({ page: '1', rowsPerPage: '10', search: 'x'.repeat(201) })
    ).toThrow();
    expect(() =>
      getAllSchema.parse({ page: '1', rowsPerPage: '10', search: 'x'.repeat(200) })
    ).not.toThrow();
  });

  test('accepts SQL metacharacters in search (they are data, not SQL)', () => {
    expect(() =>
      getAllSchema.parse({ page: '1', rowsPerPage: '10', search: `x' OR '1'='1' --` })
    ).not.toThrow();
  });
});
