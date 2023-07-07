import { Operation } from "@/app/operations/models";
import { User } from "@/app/users/models";
import { IMap } from "@/common/interfaces";

export class Record {
  id?: string;
  operation_id: string = '';
  user_id: string = '';
  amount: number = 0;
  user_balance: number = 0;
  operation_response: string = '';
  date: string = new Date().toISOString();
  created_at: string = new Date().toISOString();
  updated_at: string = new Date().toISOString();
  deleted_at?: string | null = null;

  user?: User
  operation?: Operation

  constructor(data: IMap = {}) {
    Object.assign(this, data);
  }
}