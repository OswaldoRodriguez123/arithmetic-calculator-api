import OperationEntity from './operation-entity';
import UserEntity from './user-entity';
import RecordEntity from './record-entity';
import { SequelizeInstance } from '../sequelize';

// OPERATIONS

OperationEntity.hasMany(RecordEntity, {
  as: 'records',
  foreignKey: {
    name: 'operation_id'
  }
});

// USERS

UserEntity.hasMany(RecordEntity, {
  as: 'records',
  foreignKey: {
    name: 'user_id'
  }
});

// RECORDS

RecordEntity.belongsTo(OperationEntity, { foreignKey: 'operation_id', as: 'operation' });
RecordEntity.belongsTo(UserEntity, { foreignKey: 'user_id', as: 'user' });

SequelizeInstance.sync();

export {
  OperationEntity,
  UserEntity,
  RecordEntity,
};