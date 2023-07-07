import OperationController from './';
import { OperationRepository } from '../repositories';

describe('OperationController', () => {
  test('getAll should return all operations', async () => {
    // Arrange
    const expectedOperations = [{ id: '1', name: 'Operation 1' }, { id: '2', name: 'Operation 2' }];
    jest.spyOn(OperationRepository.prototype, 'getAll').mockResolvedValue(expectedOperations);

    // Act
    const controller = new OperationController();
    const result = await controller.getAll();

    // Assert
    expect(result).toEqual(expectedOperations);
  });

  test('getById should return the operation with the specified id', async () => {
    // Arrange
    const expectedOperation = { id: '1', name: 'Operation 1' };
    jest.spyOn(OperationRepository.prototype, 'getById').mockResolvedValue(expectedOperation);

    // Act
    const controller = new OperationController();
    const result = await controller.getById('1');

    // Assert
    expect(result).toEqual(expectedOperation);
  });
});