import { Operation } from '../models';
import { IOperationRepository, OperationRepository } from '../repositories';

export interface IOperationController {
  getAll(): Promise<Operation[]>;
  getById(id: string): Promise<Operation | null>;
}

class OperationController implements IOperationController {
  private repository: IOperationRepository
  constructor() {
    this.repository = new OperationRepository();
  }
  async getAll(): Promise<Operation[]> {
    const operations = await this.repository.getAll();
    return operations ? operations : [];
  }

  async getById(id: string): Promise<Operation | null> {
    const operation = await this.repository.getById(id);
    return operation;
  }
}

export default OperationController