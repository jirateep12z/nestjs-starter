import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import {
  CreateDatabaseConfig,
  GetDefaultDatabasePort
} from './database-config.factory';

config();

const is_ts_node = process.argv.some(arg => arg.includes('ts-node'));
const is_bun = typeof (globalThis as any).Bun !== 'undefined';

const entities_path =
  is_bun || is_ts_node
    ? [
        join(__dirname, '../../modules/user/entities/*.entity.ts'),
        join(__dirname, '../../modules/rbac/entities/*.entity.ts'),
        join(__dirname, '../../modules/upload/entities/*.entity.ts'),
        join(__dirname, '../../modules/notification/entities/*.entity.ts')
      ]
    : ['dist/**/*.entity.js'];

const migrations_path =
  is_ts_node || is_bun
    ? [join(__dirname, '../../database/migrations/*.ts')]
    : ['dist/database/migrations/*.js'];

const db_type = process.env.DB_TYPE || 'mysql';
const db_url = process.env.DB_URL;
const default_port = GetDefaultDatabasePort(db_type);

const config_params: any = {
  type: db_type,
  entities: entities_path,
  migrations: migrations_path,
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  redis_enabled: process.env.REDIS_ENABLED === 'true',
  redis_config: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  query_cache_duration: parseInt(
    process.env.QUERY_CACHE_DURATION || '30000',
    10
  )
};

if (db_url) {
  config_params.url = db_url;
} else {
  config_params.host = process.env.DB_HOST || 'localhost';
  config_params.port = parseInt(
    process.env.DB_PORT || String(default_port),
    10
  );
  config_params.username = process.env.DB_USERNAME || 'root';
  config_params.password = process.env.DB_PASSWORD || '';
  config_params.database = process.env.DB_DATABASE || 'nestjs_starter';
}

export const data_source_options: DataSourceOptions =
  CreateDatabaseConfig(config_params);

const data_source = new DataSource(data_source_options);

export default data_source;
