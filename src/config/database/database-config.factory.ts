import { DataSourceOptions } from 'typeorm';

interface DatabaseConfigParams {
  type: string;
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  entities: string[];
  migrations?: string[];
  synchronize: boolean;
  logging: boolean;
  redis_enabled?: boolean;
  redis_config?: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  query_cache_duration?: number;
}

function CreateMysqlConfig(params: DatabaseConfigParams): DataSourceOptions {
  const config: any = {
    type: 'mysql',
    entities: params.entities,
    migrations: params.migrations,
    synchronize: params.synchronize,
    logging: params.logging,
    charset: 'utf8mb4',
    extra: {
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    },
    maxQueryExecutionTime: 1000,
    poolSize: 10
  };
  if (params.url) {
    config.url = params.url;
  } else {
    config.host = params.host;
    config.port = params.port;
    config.username = params.username;
    config.password = params.password;
    config.database = params.database;
  }
  if (params.redis_enabled && params.redis_config) {
    config.cache = {
      type: 'ioredis',
      options: {
        host: params.redis_config.host,
        port: params.redis_config.port,
        password: params.redis_config.password,
        db: params.redis_config.db
      },
      duration: params.query_cache_duration || 30000
    };
  }
  return config;
}

function CreatePostgresConfig(params: DatabaseConfigParams): DataSourceOptions {
  const config: any = {
    type: 'postgres',
    entities: params.entities,
    migrations: params.migrations,
    synchronize: params.synchronize,
    logging: params.logging,
    extra: {
      max: 10,
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      keepAlive: true
    },
    maxQueryExecutionTime: 1000,
    poolSize: 10
  };
  if (params.url) {
    config.url = params.url;
  } else {
    config.host = params.host;
    config.port = params.port;
    config.username = params.username;
    config.password = params.password;
    config.database = params.database;
  }
  if (params.redis_enabled && params.redis_config) {
    config.cache = {
      type: 'ioredis',
      options: {
        host: params.redis_config.host,
        port: params.redis_config.port,
        password: params.redis_config.password,
        db: params.redis_config.db
      },
      duration: params.query_cache_duration || 30000
    };
  }
  return config;
}

export function CreateDatabaseConfig(
  params: DatabaseConfigParams
): DataSourceOptions {
  const db_type = params.type.toLowerCase();
  switch (db_type) {
    case 'mysql':
    case 'mariadb':
      return CreateMysqlConfig(params);
    case 'postgres':
    case 'postgresql':
      return CreatePostgresConfig(params);
    default:
      throw new Error(
        `Unsupported database type: ${params.type}. Supported types: mysql, mariadb, postgres, postgresql.`
      );
  }
}
export function IsSupportedDatabaseType(type: string): boolean {
  const supported_types = ['mysql', 'mariadb', 'postgres', 'postgresql'];
  return supported_types.includes(type.toLowerCase());
}

export function GetDefaultDatabasePort(type: string): number {
  const db_type = type.toLowerCase();
  switch (db_type) {
    case 'mysql':
    case 'mariadb':
      return 3306;
    case 'postgres':
    case 'postgresql':
      return 5432;
    default:
      return 3306;
  }
}
