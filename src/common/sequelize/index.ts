/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '@/config';
import { Sequelize, Model, SyncOptions } from 'sequelize';
import { parse } from 'pg-connection-string';
import pg from 'pg';

function parseDbUrl(url: string) {
  if (url.includes('#')) {
    console.warn('fixing db url');
    const p = url.split('@');
    const p1 = p[0].split(':');
    const p2 = p[1];
    p1[2] = encodeURIComponent(p1[2]);
    url = p1.join(':') + '@' + p2;
  }
  return url;
}

const seqConfig = config.sequelize;
const dialect = seqConfig.dialect === 'postgresql' ? 'postgres' : seqConfig.dialect;
let uri = `${dialect}://${seqConfig.username}:${seqConfig.password}@${seqConfig.host}:${seqConfig.port}/${seqConfig.database}`;
if(seqConfig.host !== 'localhost') uri += '?sslmode=no-verify';
const parsedUri = parse(parseDbUrl(uri));
const dbName = parsedUri.database;

let createDBSuccess = false;

export function createDB(): Promise<void> {
  return new Promise((resolve) => {
    if (createDBSuccess) {
      return resolve();
    }
    const credentials = {
      ...parsedUri,
      database: 'postgres'
    };
    console.info(`Sequelize createDB: ${dbName}`);
    const pool = new pg.Pool(credentials as pg.PoolConfig);
    pool.connect((err: any, client: any, done: any) => {
      if (err) {
        console.error(`Sequelize createDB, db: ${dbName}` + err);
      }
      client.query(`CREATE DATABASE ${dbName}`, (err2: any) => {
        client.end();
        done();
        createDBSuccess = !err2;
        resolve();
      });
    });
  });
}

function loadModule() {
  console.info(`Driver pg, db: ${dbName}`);
  return pg;
}

function createSequelizeInstance() {
  return new Sequelize(uri, {
    dialectModule: loadModule(),
    logging: false
  });
}

export const SequelizeInstance = createSequelizeInstance();

export class ModelEx extends Model {

  static synchronized: boolean = false;

  static async syncEx(options?: SyncOptions) {
    if (options?.force != undefined) {
      throw new Error('Sequelize (force), it not allowed');
    }
    const infoSync = `db: ${dbName}, model: ${this.tableName}`;
    if (!this.synchronized || options?.alter == true) {
      console.info(`Sequelize sync, ${infoSync}`);
      try {
        return await super.sync(options);
      } catch (error) {
        const errorStr = `${error}`;
        console.error(`Sequelize sync, ${infoSync}`, errorStr);
        if (errorStr.includes('database ') && errorStr.includes(' does not exist')) {
          await createDB();
          console.info(`Sequelize sync, ${infoSync}`);
          return await super.sync(options);
        } else {
          throw error;
        }
      }
    }
    this.synchronized = true;
  }
}

export * from 'sequelize';