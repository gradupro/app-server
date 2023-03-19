import { PartialType } from '@nestjs/mapped-types';
import { CreateDeclarationDto } from './create-declaration.dto';

export class UpdateDeclarationDto extends PartialType(CreateDeclarationDto) {}
