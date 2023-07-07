import { OperationType } from "@/app/records/types";
import { IMap } from "@/common/interfaces";

export class Operation {
  id?: string;
  type?: OperationType;
  name?: string;
  cost?: number;
  created_at?: string;
  updated_at?: string;

  constructor(data: IMap = {}) {
    Object.assign(this, data);
  }
}