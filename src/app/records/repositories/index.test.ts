import { RecordRepository } from './';
import { RecordEntity } from '@/common/entities';

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
    jest.spyOn(RecordEntity, 'findByPk').mockResolvedValue(expectedRecord);

    // Act
    const repository = new RecordRepository();
    const result = await repository.getById('1');

    // Assert
    expect(result).toEqual(expectedRecord);
  });
});