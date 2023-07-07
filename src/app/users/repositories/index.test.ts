import { UserRepository } from './';
import { UserEntity } from '@/common/entities';

describe('UserRepository', () => {
  test('getById should return the user with the specified id', async () => {
    // Arrange
    const expectedUser = { id: '1', name: 'User 1' };
    jest.spyOn(UserEntity, 'findByPk').mockResolvedValue(UserEntity.build(expectedUser));

    // Act
    const repository = new UserRepository();
    const result = await repository.getById('1');

    // Assert
    expect(result).toEqual(expectedUser);
  });

  test('getByUsername should return the user with the specified username', async () => {
    // Arrange
    const expectedUser = { id: '1', name: 'User 1' };
    jest.spyOn(UserEntity, 'findOne').mockResolvedValue(UserEntity.build(expectedUser));

    // Act
    const repository = new UserRepository();
    const result = await repository.getByUsername('username');

    // Assert
    expect(result).toEqual(expectedUser);
  });
});