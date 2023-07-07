import { IMap } from "@/common/interfaces";

export class User {
  id?: string;
  username?: string;
  password?: string;
  name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  token?: string;

  constructor(data: IMap = {}) {
    Object.assign(this, data);
  }
}