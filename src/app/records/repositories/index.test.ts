import { RecordRepository } from './';
import { RecordEntity } from '@/common/entities';
import { Op } from 'sequelize';

describe('RecordRepository', () => {
  test('getAll should return all records', async () => {
    // Arrange
    const expectedRecords = [RecordEntity.build({
      id: '1',
      operation_id: '1',
      user_id: '1',
      amount: 1,
      user_balance: 10,
      operation_response: '1',
      date: ''
    })];
    const expectedResult = {
      rows: expectedRecords,
      count: 1 as any
    };
    jest.spyOn(RecordEntity, 'findAndCountAll').mockResolvedValue(expectedResult);

    // Act
    const repository = new RecordRepository();
    const result = await repository.getAll({
      page: '1',
      rowsPerPage: '10',
      sortField: 'id',
      sortOrder: 'asc',
      search: '',
      userId: '123'
    });

    // Assert
    expect(result).toEqual({
      rows: expectedRecords,
      count: 1
    });
  });

  test('search date predicate binds the pattern instead of interpolating SQL', async () => {
    // Arrange
    const findSpy = jest.spyOn(RecordEntity, 'findAndCountAll').mockResolvedValue({ rows: [], count: 0 } as any);
    findSpy.mockClear();
    const payload = `x' OR '1'='1' --`;

    // Act
    const repository = new RecordRepository();
    await repository.getAll({ page: '1', rowsPerPage: '10', search: payload, userId: 'u' } as any);

    // Assert
    const options = findSpy.mock.calls[0][0] as any;
    const orPredicates: any[] = options.where[Op.or];
    // No raw Sequelize.literal anywhere in the search predicates.
    expect(orPredicates.some((p) => p?.constructor?.name === 'Literal')).toBe(false);
    // The date leg binds the payload as an Op.like parameter.
    const whereLeg = orPredicates.find((p) => p?.constructor?.name === 'Where');
    expect(whereLeg?.logic?.[Op.like]).toBe(`%${payload}%`);
  });

  test('clamps rowsPerPage and page defensively', async () => {
    // Arrange
    const findSpy = jest.spyOn(RecordEntity, 'findAndCountAll').mockResolvedValue({ rows: [], count: 0 } as any);
    findSpy.mockClear();

    // Act
    const repository = new RecordRepository();
    await repository.getAll({ page: '999999', rowsPerPage: '5000', userId: 'u' } as any);

    // Assert
    const options = findSpy.mock.calls[0][0] as any;
    expect(options.limit).toBe(100);
    expect(options.offset).toBeGreaterThanOrEqual(0);
  });

  test('falls back to safe paging defaults for unparsable input', async () => {
    // Arrange
    const findSpy = jest.spyOn(RecordEntity, 'findAndCountAll').mockResolvedValue({ rows: [], count: 0 } as any);
    findSpy.mockClear();

    // Act
    const repository = new RecordRepository();
    await repository.getAll({ page: 'abc', rowsPerPage: '', userId: 'u' } as any);

    // Assert
    const options = findSpy.mock.calls[0][0] as any;
    expect(options.limit).toBe(10);
    expect(options.offset).toBe(0);
  });

  test('getById should return the record with the specified id', async () => {
    // Arrange
    const expectedRecord = RecordEntity.build({
      id: '1',
      operation_id: '1',
      user_id: '1',
      amount: 1,
      user_balance: 10,
      operation_response: '1',
      date: ''
    });
    jest.spyOn(RecordEntity, 'findOne').mockResolvedValue(expectedRecord);

    // Act
    const repository = new RecordRepository();
    const result = await repository.getById('1', 'user123');

    // Assert
    expect(result).toEqual(expectedRecord);
  });

  test('getById scopes the lookup to the owning user and non-deleted rows', async () => {
    // Arrange
    const findOneSpy = jest.spyOn(RecordEntity, 'findOne').mockResolvedValue(null);

    // Act
    const repository = new RecordRepository();
    await repository.getById('rec1', 'user123');

    // Assert
    expect(findOneSpy).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'rec1', user_id: 'user123', deleted_at: null },
    }));
  });

  test('delete scopes the soft-delete to the owning user', async () => {
    // Arrange
    const updateSpy = jest.spyOn(RecordEntity, 'update').mockResolvedValue([1] as any);

    // Act
    const repository = new RecordRepository();
    const affected = await repository.delete('rec1', 'user123');

    // Assert
    expect(affected).toBe(1);
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_at: expect.any(String) }),
      expect.objectContaining({
        where: { id: 'rec1', user_id: 'user123', deleted_at: null },
      }),
    );
  });
});