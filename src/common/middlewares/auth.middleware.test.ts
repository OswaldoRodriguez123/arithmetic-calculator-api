import isAuth from './auth.middleware';
import { UserEntity } from '@/common/entities';
import { createToken } from '../services/jwt.service';

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(authHeader?: string) {
  return {
    get: (name: string) => (name.toLowerCase() === 'authorization' ? authHeader : undefined),
    params: {},
  } as any;
}

describe('auth.middleware (isAuth)', () => {
  test('returns 401 when the Authorization header is missing', async () => {
    const res = mockRes();
    const next = jest.fn();

    await isAuth(mockReq(undefined), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 for a garbage token', async () => {
    const res = mockRes();
    const next = jest.fn();

    await isAuth(mockReq('Bearer not-a-token'), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 for a well-formed token without an id claim', async () => {
    const res = mockRes();
    const next = jest.fn();
    const token = createToken({ name: 'No Id' });

    await isAuth(mockReq(`Bearer ${token}`), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when the token user does not exist', async () => {
    jest.spyOn(UserEntity, 'findByPk').mockResolvedValue(null as any);
    const res = mockRes();
    const next = jest.fn();
    const token = createToken({ id: 'ghost' });

    await isAuth(mockReq(`Bearer ${token}`), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when the token user is not active', async () => {
    jest.spyOn(UserEntity, 'findByPk').mockResolvedValue(
      UserEntity.build({ id: '1', username: 'u', status: 'inactive' } as any) as any
    );
    const res = mockRes();
    const next = jest.fn();
    const token = createToken({ id: '1' });

    await isAuth(mockReq(`Bearer ${token}`), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next and stashes userId when the token user exists and is active', async () => {
    jest.spyOn(UserEntity, 'findByPk').mockResolvedValue(
      UserEntity.build({ id: '1', username: 'u', status: 'active' } as any) as any
    );
    const res = mockRes();
    const next = jest.fn();
    const req = mockReq(`Bearer ${createToken({ id: '1' })}`);

    await isAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.params.userId).toBe('1');
    expect(res.status).not.toHaveBeenCalled();
  });
});
