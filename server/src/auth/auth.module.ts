import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { verifyProviders } from './auth.providers';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [...verifyProviders, AuthService],
})
export class AuthModule {}
