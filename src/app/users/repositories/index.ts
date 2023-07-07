import { User } from '../models';
import { UserEntity } from '@/common/entities';

export interface IUserRepository {
  getByUsername(username: string) : Promise<User | null>;
  getById(id: string) : Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  async getByUsername(username: string): Promise<User | null> {
    try {
      const user = await UserEntity.findOne({
        where: {
          username: username,
          status: 'active'
        }
      });

      if (!user) {
        return null;
      }

      return user.toJSON() as User;

    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getById(id: string): Promise<User | null> {
    const user = await UserEntity.findByPk(id);

    if (!user) {
      return null;
    }

    return user.toJSON() as User;
  }

}