import { CreationOptional, DataTypes, Model } from 'sequelize';
import { SequelizeInstance } from '../sequelize';

class User extends Model {
  declare id: CreationOptional<string>;
  declare username: string;
  declare password: string;
  declare name: string;
  declare status: string;
  declare created_at: CreationOptional<string>;
  declare updated_at: CreationOptional<string>;
}

User.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  name: DataTypes.STRING,
  status: DataTypes.STRING,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  sequelize: SequelizeInstance,
  modelName: 'users',
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id'],
    }
  ]
});

export default User;