import { Record } from '../models';
import { OperationEntity, RecordEntity } from '@/common/entities';
import { Op, Sequelize } from 'sequelize';
import { GetAllResponse, Filters } from './../types';

export interface IRecordRepository {
  getAll(filters: Filters) : Promise<GetAllResponse>;
  getById(id: string) : Promise<RecordEntity | null>;
  store(data: Record) : Promise<RecordEntity | null>;
  getLastRecord(userId: string) : Promise<RecordEntity | null>;
  delete(id: string) : Promise<number>;
}

export class RecordRepository implements IRecordRepository {
  async getAll(filters: Filters): Promise<GetAllResponse> {

    const { page, rowsPerPage, sortField, sortOrder, search, userId } = filters;

    const whereClause = search
      ? {
          [Op.or]: [
            { id: { [Op.like]: `%${search}%` } },
            { '$operation.name$': { [Op.like]: `%${search}%` } },
            { operation_response: { [Op.like]: `%${search}%` } },
            { operation_response: { [Op.like]: `%${search}%` } },
            Sequelize.literal(`CAST(date as TEXT) LIKE '%${search}%'`),
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
      limit: Number(rowsPerPage),
      offset: (Number(page) - 1) * Number(rowsPerPage),
      include: [
        { model: OperationEntity, as: 'operation', attributes: [] }
      ],
    });

    return records;
  }

  async getById(id: string): Promise<RecordEntity | null> {
    const record = await RecordEntity.findByPk(id);

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

  async delete(id: string): Promise<number> {
    const result = await RecordEntity.update(
      {
        deleted_at: new Date().toISOString()
      },
      {
        where: { id }
      }
    );

    return result[0];
  }
}