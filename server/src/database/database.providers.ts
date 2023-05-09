import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const options: DataSourceOptions = {
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: 3306,
        timezone: '+09:00',
        charset: 'utf8mb4_general_ci',
        logging: true,
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: `emerdy_${configService.get('NODE_ENV')}`,
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
