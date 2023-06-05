import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PushNotificationService } from './pushNotification.service';
import { PushNotificationConsumer } from './pushNotification.consumer';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NaverCloudModule } from '../naver-cloud/naver-cloud.module';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bull';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
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
export class PushNotificationModule {
  @Inject(getQueueToken('push-notification'))
  private readonly queue: Queue;

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');
    const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
      queues: [new BullMQAdapter(this.queue, { allowRetries: true, readOnlyMode: true })],
      serverAdapter,
    });
    consumer.apply(serverAdapter.getRouter()).forRoutes('/queues');
  }
}
