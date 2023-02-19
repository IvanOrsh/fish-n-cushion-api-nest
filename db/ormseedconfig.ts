import { DataSource, DataSourceOptions } from 'typeorm';

import { dataSourceOptions } from './data-source';

export const ormseedconfig: DataSourceOptions = {
  ...dataSourceOptions,
  migrations: ['dist/db/seeds/*.js'],
};

export default new DataSource(ormseedconfig);
