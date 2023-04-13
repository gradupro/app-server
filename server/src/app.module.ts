import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ReportModule } from './report/report.module';
import { LocationModule } from './location/location.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UserModule, DatabaseModule, ReportModule, LocationModule, AuthModule, SocketModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [SocketModule],
})
export class AppModule {}
