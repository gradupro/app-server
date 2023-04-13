import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { ReportModule } from '../report/report.module';
import { UserModule } from '../user/user.module';
import { SocketModule } from '../socket/socket.module';
import { locationProviders } from './location.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, ReportModule, UserModule, SocketModule],
  controllers: [LocationController],
  providers: [...locationProviders, LocationService],
  exports: [...locationProviders, LocationService],
})
export class LocationModule {}
