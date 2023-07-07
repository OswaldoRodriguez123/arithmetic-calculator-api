import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import { SequelizeInstance } from '../sequelize';
import OperationEntity from './operation-entity';
import UserEntity from './user-entity';

class Record extends Model
  <
    InferAttributes<Record, { omit: 'operation' | 'user' }>,
    InferCreationAttributes<Record, { omit: 'operation' | 'user' }>
  >
{
  declare id: CreationOptional<string>;
  declare operation_id: string;
  declare user_id: string;
  declare amount: number;
  declare user_balance: number;
  declare operation_response: string;
  declare date: string;
  declare created_at: CreationOptional<string>;
  declare updated_at: CreationOptional<string>;
  declare deleted_at: CreationOptional<string | null>;

  declare operation?: NonAttribute<OperationEntity>;
  declare user?: NonAttribute<UserEntity>;

  declare static associations: {
    operation: Association<Record, OperationEntity>;
    user: Association<Record, UserEntity>;
  }
}

Record.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  operation_id: {
    type: DataTypes.STRING,
    references: {
      model: OperationEntity,
      key: 'id',
    }
  },
  user_id: {
    type: DataTypes.STRING,
    references: {
      model: UserEntity,
      key: 'id',
    }
  },
  amount: DataTypes.INTEGER,
  user_balance: DataTypes.INTEGER,
  operation_response: DataTypes.STRING,
  date: DataTypes.DATE,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
  deleted_at: DataTypes.DATE,
}, {
  sequelize: SequelizeInstance,
  modelName: 'records',
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id'],
    }
  ]
});

export default Record;