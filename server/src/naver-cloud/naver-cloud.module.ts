import { Module } from '@nestjs/common';
import { NaverCloudService } from './naver-cloud.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [NaverCloudService],
  exports: [NaverCloudService],
})
export class NaverCloudModule {}
