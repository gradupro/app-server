import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { NotificationDTO } from './dto/notification.dto';

@Injectable()
export class PushNotificationService {
  constructor(@InjectQueue('push-notification') private pushNotificationQueue: Queue) {}

  async addJob(data: NotificationDTO) {
    try {
      console.log('running add job');
      const job = await this.pushNotificationQueue.add('pushNotification', data, {
        attempts: 3,
      });
      return job.id;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
