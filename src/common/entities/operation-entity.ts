import { CreationOptional, DataTypes, Model } from 'sequelize';
import { SequelizeInstance } from '../sequelize';
import { OperationType } from '@/app/records/types';

class Operation extends Model {
  declare id: CreationOptional<string>;
  declare type: OperationType;
  declare name: string;
  declare cost: number;
  declare created_at: CreationOptional<string>;
  declare updated_at: CreationOptional<string>;
}

Operation.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  type: DataTypes.STRING,
  name: DataTypes.STRING,
  cost: DataTypes.INTEGER,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  sequelize: SequelizeInstance,
  modelName: 'operations',
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id'],
    }
  ]
});

export default Operation;