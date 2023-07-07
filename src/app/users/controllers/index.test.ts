import UserController from './';
import { UserRepository } from '../repositories';
import * as commonFunctions from '../utils/common';

describe('UserController', () => {
  test('login should return the user with the specified params', async () => {
    // Arrange
    const expectedUser = { id: '1', name: 'User 1', password: '' };
    jest.spyOn(UserRepository.prototype, 'getByUsername').mockResolvedValue(expectedUser);
    jest.spyOn(commonFunctions, 'compareHash').mockReturnValue(true);

    // Act
    const controller = new UserController();
    const result = await controller.login({ username: 'user1', password: 'password1' });

    // Assert
    expect(result).toEqual(expectedUser);
  });

  test('getById should return the user with the specified id', async () => {
    // Arrange
    const expectedUser = { id: '1', name: 'User 1' };
    jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue(expectedUser);

    // Act
    const controller = new UserController();
    const result = await controller.getById('1');

    // Assert
    expect(result).toEqual(expectedUser);
  });

  test('getByUsername should return the user with the specified username', async () => {
    // Arrange
    const expectedUser = { id: '1', name: 'User 1' };
    jest.spyOn(UserRepository.prototype, 'getByUsername').mockResolvedValue(expectedUser);

    // Act
    const controller = new UserController();
    const result = await controller.getByUsername('username1');

    // Assert
    expect(result).toEqual(expectedUser);
  });
});