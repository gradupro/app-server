import { DataSource } from 'typeorm';
import { Verify } from './entities/auth.entity';

export const verifyProviders = [
  {
    provide: 'VERIFY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Verify),
    inject: ['DATA_SOURCE'],
  },
];
