import { Record } from '../models';
import { OperationEntity, RecordEntity } from '@/common/entities';
import { Op, Sequelize } from 'sequelize';
import { GetAllResponse, Filters } from './../types';

export interface IRecordRepository {
  getAll(filters: Filters) : Promise<GetAllResponse>;
  getById(id: string, userId: string) : Promise<RecordEntity | null>;
  store(data: Record) : Promise<RecordEntity | null>;
  getLastRecord(userId: string) : Promise<RecordEntity | null>;
  delete(id: string, userId: string) : Promise<number>;
}

export class RecordRepository implements IRecordRepository {
  async getAll(filters: Filters): Promise<GetAllResponse> {

    const { page, rowsPerPage, sortField, sortOrder, search, userId } = filters;

    // Defense in depth: the schema caps these too, but repository callers
    // may bypass it. Never let limit/offset be NaN, negative or huge.
    const limit = Math.min(Math.max(parseInt(String(rowsPerPage), 10) || 10, 1), 100);
    const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
    const offset = (pageNumber - 1) * limit;

    const term = search ? String(search).slice(0, 200) : undefined;
    const like = term ? `%${term}%` : undefined;
    const whereClause = like
      ? {
          [Op.or]: [
            { id: { [Op.like]: like } },
            { '$operation.name$': { [Op.like]: like } },
            { operation_response: { [Op.like]: like } },
            Sequelize.where(Sequelize.cast(Sequelize.col('date'), 'TEXT'), { [Op.like]: like }),
          ]
        }
      : {};

    const records = await RecordEntity.findAndCountAll({
      attributes: [
        'id',
        'date',
        'operation_response',
        [Sequelize.literal('operation.name'), 'name']
      ],
      where: {
        user_id: userId,
        deleted_at: null,
        ...whereClause
      },
      order: sortField && sortOrder ? [[sortField, sortOrder]] : undefined,
      limit,
      offset,
      include: [
        { model: OperationEntity, as: 'operation', attributes: [] }
      ],
    });

    return records;
  }

  async getById(id: string, userId: string): Promise<RecordEntity | null> {
    const record = await RecordEntity.findOne({
      where: {
        id,
        user_id: userId,
        deleted_at: null,
      },
    });

    return record;
  }

  async store(data: Record): Promise<RecordEntity | null> {
    const record = await RecordEntity.create(data);

    return record;
  }

  async getLastRecord(userId: string): Promise<RecordEntity | null> {
    const record = await RecordEntity.findOne({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      order: [ [ 'date', 'DESC' ]],
    });

    return record;
  }

  async delete(id: string, userId: string): Promise<number> {
    const result = await RecordEntity.update(
      {
        deleted_at: new Date().toISOString()
      },
      {
        where: { id, user_id: userId, deleted_at: null }
      }
    );

    return result[0];
  }
}