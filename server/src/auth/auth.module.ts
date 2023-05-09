import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { verifyProviders } from './auth.providers';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';
import { NaverCloudModule } from '../naver-cloud/naver-cloud.module';

@Global()
@Module({
  imports: [DatabaseModule, ConfigModule, NaverCloudModule],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [...verifyProviders, AuthService],
})
export class AuthModule {}
