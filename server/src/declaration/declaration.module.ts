import { Module } from '@nestjs/common';
import { DeclarationService } from './declaration.service';
import { DeclarationController } from './declaration.controller';

@Module({
  controllers: [DeclarationController],
  providers: [DeclarationService]
})
export class DeclarationModule {}
