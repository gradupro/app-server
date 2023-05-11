import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { userProviders } from './user.providers';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { NaverCloudModule } from '../naver-cloud/naver-cloud.module';
import { PushNotificationModule } from '../pushNotification/pushNotification.module';

@Module({
  imports: [DatabaseModule, AuthModule, NaverCloudModule, PushNotificationModule],
  controllers: [UserController],
  providers: [...userProviders, UserService],
  exports: [...userProviders, UserService],
})
export class UserModule {}
