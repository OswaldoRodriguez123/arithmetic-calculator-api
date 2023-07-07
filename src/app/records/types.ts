import { RecordEntity } from "@/common/entities";

export interface StoreControllerProps {
  firstNumber?: string;
  lastNumber?: string;
  operation_id: string;
  userId: string;
}

export enum OperationType {
  Addition = 'addition',
  Subtraction = 'subtraction',
  Multiplication = 'multiplication',
  Division = 'division',
  SquareRoot = 'square_root',
  RandomString = 'random_string',
}

export interface GetAllResponse {
  rows: RecordEntity[],
  count: number
}

export interface Filters {
  page: string,
  rowsPerPage: string,
  sortField?: string,
  sortOrder?: string,
  search?: string,
  userId: string,
}
