import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NaverCloudService } from '../naver-cloud/naver-cloud.service';
import { NotificationDTO } from './dto/notification.dto';

@Processor('push-notification')
export class PushNotificationConsumer {
  constructor(private naverCloudService: NaverCloudService) {}
  @Process('pushNotification')
  async handleTranscode(job: Job) {
    console.log('Start pushing Notification...');
    const data: NotificationDTO = job.data;
    await this.naverCloudService.pushNotification(data);
    console.log('Pushing Notification completed');
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `onActive : Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}...`,
    );
  }

  @OnQueueFailed()
  OnQueueFailed(job: Job) {
    console.log(
      `OnQueueFailed : Failed job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}.`,
    );
    console.log(`Failed Reason is ${job.failedReason}`);
  }

  @OnQueueCompleted()
  OnQueueCompleted(job: Job) {
    console.log(
      `OnQueueCompleted : Completed job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}.`,
    );
  }
}
