import { createToken } from '@/common/services/jwt.service';
import { User } from '../models';
import { IUserRepository, UserRepository } from '../repositories';
import { compareHash } from '../utils/common';

interface LoginProps {
  username: string;
  password: string;
}

export interface IUserController {
  login(props: LoginProps): Promise<User | null>;
  getByUsername(username: string): Promise<User | null>;
  getById(username: string): Promise<User | null>;
}

class UserController implements IUserController {
  private repository: IUserRepository
  constructor() {
    this.repository = new UserRepository();
  }

  async login({ username, password } : LoginProps) {
    const user = await this.getByUsername(username);
    if(!user) return null;
    if(!compareHash(password, user?.password || '')) return null;

    user.token = createToken({ name: user?.name, id: user.id });
    delete user.password;

    return user;
  }
  async getByUsername(username: string): Promise<User | null> {
    const user = await this.repository.getByUsername(username);
    return user ? user : null;
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.repository.getById(id);
    return user ? user : null;
  }
}

export default UserController