import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { UserModule } from '../user/user.module';
import { ReportModule } from '../report/report.module';
import { DatabaseModule } from '../database/database.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [DatabaseModule, UserModule, ReportModule, forwardRef(() => LocationModule)],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway],
})
export class SocketModule {}
