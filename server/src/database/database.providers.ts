import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const options: DataSourceOptions = {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        timezone: 'Asia/Seoul',
        charset: 'utf8mb4_general_ci',
        logging: true,
        username: 'root',
        password: '1234',
        database: 'emerdy',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      };

      await createDatabase({
        options,
      });
      const dataSource = new DataSource(options);
      return dataSource.initialize();
    },
  },
];
