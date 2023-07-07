import { envString, envNumber } from './env';

export type ConfigDefault = {
  app: {
    port: number;
  },
  sequelize: {
    dialect: string;
    database: string;
    username: string;
    password: string;
    host: string;
    port: number;
  },
}

const configDefault: ConfigDefault = {
  app: {
    port: envNumber('APP_PORT', 3001),
  },
  sequelize: {
    dialect: envString('DATABASE_DIALECT', 'postgres'),
    database: envString('DATABASE_NAME', 'arithmetic_calculator'),
    username: envString('DATABASE_USERNAME', 'postgres'),
    password: envString('DATABASE_PASSWORD', '1234'),
    host: envString('DATABASE_HOST', 'localhost'),
    port: envNumber('DATABASE_PORT', 5432),
  },
};

export default configDefault;