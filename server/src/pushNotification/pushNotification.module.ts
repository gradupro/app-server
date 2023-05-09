import { Module } from '@nestjs/common';
import { PushNotificationService } from './pushNotification.service';
import { PushNotificationConsumer } from './pushNotification.consumer';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NaverCloudModule } from '../naver-cloud/naver-cloud.module';

@Module({
  imports: [
    NaverCloudModule,
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: 'push-notification',
      useFactory: (configService: ConfigService) => {
        return {
          redis: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            password: configService.get('REDIS_PASSWORD'),
            username: configService.get('REDIS_USER'),
          },
        };
      },
    }),
  ],
  controllers: [],
  providers: [PushNotificationService, PushNotificationConsumer],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
