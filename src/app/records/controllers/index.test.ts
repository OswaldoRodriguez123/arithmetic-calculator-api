import RecordController from './';
import { RecordRepository } from '../repositories';
import { Filters, OperationType, StoreControllerProps } from './../types';
import { OperationEntity, RecordEntity, UserEntity } from '@/common/entities';
import OperationController from '@/app/operations/controllers';
import UserController from '@/app/users/controllers';
import { newRecordSchema } from '../schemas';

const recordController = new RecordController();

describe('OperationRepository', () => {
  test('getAll should return an array of RecordEntity', async () => {
    // Arrange
    const filters: Filters = {
      page: '1',
      rowsPerPage: '10',
      sortField: 'id',
      sortOrder: 'asc',
      search: '',
      userId: '123'
    };

    const expectedRecords = {
      rows: [
        RecordEntity.build({
          id: '1',
          operation_id: '1',
          user_id: '123',
          amount: 10,
          user_balance: 100,
          operation_response: '',
          date: '',
          created_at: '',
          updated_at: ''
        },
      )],
      count: 1
    };

    jest.spyOn(RecordRepository.prototype, 'getAll').mockResolvedValue(expectedRecords);

    // Act
    const result = await recordController.getAll(filters);

    // Assert
    expect(result).toEqual(expectedRecords);
  });
  test('getById should return the record with the specified id', async () => {
    // Arrange
    const expectedRecord = RecordEntity.build({
      id: '1',
      operation_id: '1',
      user_id: '123',
      amount: 10,
      user_balance: 100,
      operation_response: '',
      date: '',
      created_at: '',
      updated_at: ''
    });
    jest.spyOn(RecordRepository.prototype, 'getById').mockResolvedValue(expectedRecord);

    // Act
    const result = await recordController.getById('1');

    // Assert
    expect(result).toEqual(expectedRecord);
  });

  test('store should store a new record and return the stored record', async () => {

    const userId = '123';

    const mockOperation = OperationEntity.build({ type: 'addition' as OperationType, cost: 10 });
    const mockUser = UserEntity.build({ id: '123', name: 'John Doe' });
    const mockRecord = RecordEntity.build({
      id: 'abc',
      operation_id: '1',
      user_id: '123',
      amount: 10,
      user_balance: 90,
      operation_response: '15',
      date: '2023-04-07T12:00:00.000Z',
      created_at: '2023-04-07T12:00:00.000Z',
      updated_at: '2023-04-07T12:00:00.000Z'
    });

    jest.spyOn(OperationController.prototype, 'getById').mockResolvedValue(mockOperation);
    jest.spyOn(UserController.prototype, 'getById').mockResolvedValue(mockUser);

    // Arrange
    const props: StoreControllerProps = {
      operation_id: '1',
      firstNumber: '10',
      lastNumber: '5',
      userId: '123',
    };

    jest.spyOn(RecordRepository.prototype, 'store').mockResolvedValue(mockRecord);
    jest.spyOn(newRecordSchema, 'parse');

    // Act
    const result = await recordController.store(props);

    // Assert
    expect(result).toEqual(mockRecord);
    expect(newRecordSchema.parse).toHaveBeenCalledWith(props);
  });
});