import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { reportProviders } from './report.providers';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PushNotificationModule } from '../pushNotification/pushNotification.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    HttpModule,
    UserModule,
    AuthModule,
    PushNotificationModule,
    SocketModule,
  ],
  controllers: [ReportController],
  providers: [...reportProviders, ReportService],
  exports: [...reportProviders, ReportService],
})
export class ReportModule {}
