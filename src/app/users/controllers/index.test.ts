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

  test('login runs a decoy compare when the user does not exist', async () => {
    // Arrange
    jest.spyOn(UserRepository.prototype, 'getByUsername').mockResolvedValue(null);
    const compareSpy = jest.spyOn(commonFunctions, 'compareHash').mockReturnValue(false);

    // Act
    const controller = new UserController();
    const result = await controller.login({ username: 'nosuchuser', password: 'secret123' });

    // Assert
    expect(result).toBeNull();
    // The failure path must cost as much as the success path (bcrypt compare),
    // otherwise usernames can be enumerated by timing.
    expect(compareSpy).toHaveBeenCalledWith('secret123', commonFunctions.DECOY_HASH);
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