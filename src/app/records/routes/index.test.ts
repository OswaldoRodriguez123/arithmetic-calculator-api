import request from 'supertest';
import { createApp, API_URL } from '../../../../app';
import { RecordEntity, UserEntity } from '@/common/entities';
import { createToken } from '@/common/services/jwt.service';

const app = createApp();
const token = () => createToken({ id: 'user-1' });

function mockActiveUser() {
  jest.spyOn(UserEntity, 'findByPk').mockResolvedValue(
    UserEntity.build({ id: 'user-1', username: 'u', status: 'active' } as any) as any
  );
}

describe('DELETE /records/:id', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns 401 without a token', async () => {
    const res = await request(app).delete(`${API_URL}/records/some-uuid`);
    expect(res.status).toBe(401);
  });

  test('returns 204 and soft-deletes the record scoped to the caller', async () => {
    mockActiveUser();
    const updateSpy = jest.spyOn(RecordEntity, 'update').mockResolvedValue([1] as any);

    const res = await request(app)
      .delete(`${API_URL}/records/some-uuid`)
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_at: expect.any(String) }),
      expect.objectContaining({
        where: { id: 'some-uuid', user_id: 'user-1', deleted_at: null },
      }),
    );
  });

  test('returns 404 without leaking affected-row counts when nothing was deleted', async () => {
    mockActiveUser();
    jest.spyOn(RecordEntity, 'update').mockResolvedValue([0] as any);

    const res = await request(app)
      .delete(`${API_URL}/records/some-uuid`)
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Record not found' });
    expect(JSON.stringify(res.body)).not.toMatch(/affected|rows|count/i);
  });
});
