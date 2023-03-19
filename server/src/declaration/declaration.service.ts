import { Injectable } from '@nestjs/common';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { UpdateDeclarationDto } from './dto/update-declaration.dto';

@Injectable()
export class DeclarationService {
  create(createDeclarationDto: CreateDeclarationDto) {
    return 'This action adds a new declaration';
  }

  findAll() {
    return `This action returns all declaration`;
  }

  findOne(id: number) {
    return `This action returns a #${id} declaration`;
  }

  update(id: number, updateDeclarationDto: UpdateDeclarationDto) {
    return `This action updates a #${id} declaration`;
  }

  remove(id: number) {
    return `This action removes a #${id} declaration`;
  }
}
