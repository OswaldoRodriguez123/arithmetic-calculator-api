import { OperationRepository } from './';
import { OperationEntity } from '@/common/entities';

describe('OperationRepository', () => {
  test('getAll should return all operations', async () => {
    // Arrange
    const expectedOperations = [{ id: '1', name: 'Operation 1' }];
    jest.spyOn(OperationEntity, 'findAll').mockResolvedValue([OperationEntity.build(expectedOperations[0])]);

    // Act
    const repository = new OperationRepository();
    const result = await repository.getAll();

    // Assert
    expect(result).toEqual(expectedOperations);
  });

  test('getById should return the operation with the specified id', async () => {
    // Arrange
    const expectedOperation = { id: '1', name: 'Operation 1' };
    jest.spyOn(OperationEntity, 'findByPk').mockResolvedValue(OperationEntity.build(expectedOperation));

    // Act
    const repository = new OperationRepository();
    const result = await repository.getById('1');

    // Assert
    expect(result).toEqual(expectedOperation);
  });
});