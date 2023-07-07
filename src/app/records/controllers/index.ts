import { RecordEntity } from '@/common/entities';
import { IRecordRepository, RecordRepository } from '../repositories';
import { OperationType, StoreControllerProps } from '../types';
import { Record } from '../models';
import { v4 as uuid } from 'uuid';
import OperationController, { IOperationController } from '@/app/operations/controllers';
import UserController, { IUserController } from '@/app/users/controllers';
import { Filters, GetAllResponse } from './../types';
import { operation_generator } from '../utils';
import { getAllSchema, newRecordSchema } from '../schemas';

export interface IRecordController {
  getAll(filters: Filters): Promise<GetAllResponse>;
  getById(id: string): Promise<RecordEntity | null>;
  store(data: StoreControllerProps): Promise<RecordEntity | null>;
  getUserBalance(userId: string, amount: number): Promise<number>;
  getOperationResponse(type: OperationType, props: StoreControllerProps): Promise<string>;
}

class RecordController implements IRecordController {
  private repository: IRecordRepository
  private operationController: IOperationController
  private userController: IUserController
  private INITIAL_USER_BALANCE = 200;
  constructor() {
    this.repository = new RecordRepository();
    this.operationController = new OperationController();
    this.userController = new UserController();
  }
  async getAll(filters: Filters): Promise<GetAllResponse> {
    try {
      getAllSchema.parse(filters);
      const records = await this.repository.getAll(filters);
      return records
    } catch (err) {
      console.error(err);
      return {
        rows: [],
        count: 0
      };
    }
  }

  async getById(id: string): Promise<RecordEntity | null> {
    if(!id) throw new Error("id is required");
    const record = await this.repository.getById(id);
    return record;
  }

  async store(props: StoreControllerProps) {
    try {

      newRecordSchema.parse(props);
      const userId = props.userId;

      const operationId = props.operation_id;

      const operation = await this.operationController.getById(operationId);
      if (!operation) return null;

      const amount = operation.cost || 0;

      const user = await this.userController.getById(userId);
      if (!user) return null;

      const userBalance = await this.getUserBalance(userId, amount);
      if (userBalance < 0) return null;

      const operationResponse = await this.getOperationResponse(operation.type || OperationType.Addition, props);

      const data: Record = {
        id: uuid(),
        operation_id: operationId,
        user_id: userId,
        amount,
        user_balance: userBalance,
        operation_response: operationResponse,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const record = await this.repository.store(data);
      return record;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getUserBalance(userId: string, amount: number) {
    const lastRecord = await this.repository.getLastRecord(userId);
    const currentBalance = lastRecord ? lastRecord.user_balance : this.INITIAL_USER_BALANCE;
    const userBalance = currentBalance - amount;

    return userBalance;
  }

  async getOperationResponse(type: OperationType, props: StoreControllerProps) {

    let operation_response = '';
    const { add, subtract, multiply, divide, square_root, random_string_generator } = operation_generator;
    const firstNumber = Number(props.firstNumber);
    const lastNumber = Number(props.lastNumber);

    switch(type) {
      case OperationType.Addition:
        operation_response = add(firstNumber, lastNumber).toString()
        break;
      case OperationType.Subtraction:
        operation_response = subtract(firstNumber, lastNumber).toString()
        break;
      case OperationType.Multiplication:
        operation_response = multiply(firstNumber, lastNumber).toString()
        break;
      case OperationType.Division:
        operation_response = divide(firstNumber, lastNumber).toString()
        break;
      case OperationType.SquareRoot:
        operation_response = square_root(firstNumber).toString()
        break;
      case OperationType.RandomString:
        operation_response = await random_string_generator()
        break;
    }

    return operation_response;
  }

  async delete(id: string): Promise<number> {
    const affectedRows = await this.repository.delete(id);
    return affectedRows;
  }
}

export default RecordController