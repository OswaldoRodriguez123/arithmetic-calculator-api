import { Operation } from '../models';
import { OperationEntity } from '@/common/entities';

export interface IOperationRepository {
  getAll() : Promise<Operation[] | null>;
  getById(id: string) : Promise<Operation | null>;
}

export class OperationRepository implements IOperationRepository {
  async getAll(): Promise<Operation[] | null> {
    const operations = await OperationEntity.findAll();

    if (!operations) {
      return null;
    }

    return operations ? operations.map((d) => d.toJSON()) : [] as Operation[];
  }

  async getById(id: string): Promise<Operation | null> {
    const operation = await OperationEntity.findByPk(id);

    return operation ? operation.toJSON() : null;
  }
}