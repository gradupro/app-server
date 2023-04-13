import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const options: DataSourceOptions = {
        type: 'mysql',
        host: process.env.DATABASE_HOST,
        port: 3306,
        timezone: '+09:00',
        charset: 'utf8mb4_general_ci',
        logging: true,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: `emerdy_${process.env.NODE_ENV}`,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        legacySpatialSupport: false,
      };

      await createDatabase({
        options,
      });
      const dataSource = new DataSource(options);
      return dataSource.initialize();
    },
  },
];
