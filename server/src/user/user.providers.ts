import { DataSource } from 'typeorm';
import { User, UserProtector } from './entities/user.entity';

export const userProviders = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },

  {
    provide: 'PROTECTOR_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserProtector),
    inject: ['DATA_SOURCE'],
  },
];
