import { DataSource } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { Report } from './entities/report.entity';
import { Voice } from './entities/voice.entity';

export const reportProviders = [
  {
    provide: 'REPORT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Report),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'VOICE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Voice),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PREDICTION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Prediction),
    inject: ['DATA_SOURCE'],
  },
];
