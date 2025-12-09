import { DataSource, DataSourceOptions } from 'typeorm';
import { envVariables } from './env.schema';
import { registerAs } from '@nestjs/config';
import { configConstants } from './config.constants';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// TypeORM DataSource configuration

//console.log(envVariables);
const dataSourceConfig: DataSourceOptions = {
  type: envVariables.DATABASE_DIALECT,
  host: envVariables.DATABASE_HOST,
  port: envVariables.DATABASE_PORT,
  username: envVariables.DATABASE_USERNAME,
  password: envVariables.DATABASE_PASSWORD,
  database: envVariables.DATABASE_NAME,
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/history/*.ts'],
  migrationsTableName: 'migrations',
  metadataTableName: 'typeorm_metadata',
};

export default registerAs(configConstants.TYPEORM, () => dataSourceConfig);
export const connectionSource = new DataSource(
  dataSourceConfig as DataSourceOptions,
);
