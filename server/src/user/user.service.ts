import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User, UserProtector, userToken } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('PROTECTOR_REPOSITORY')
    private protectorRepository: Repository<UserProtector>,
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<userToken> {
    try {
      const result: userToken = {
        created: true,
        accessToken: '',
      };
      const createdUser = await this.userRepository
        .createQueryBuilder()
        .insert()
        .values([createUserDto])
        .execute();
      console.log(createdUser);
      result.accessToken = await this.authService.createJWT(
        createdUser.raw.insertId,
      );
      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<userToken> {
    try {
      const result: userToken = {
        created: false,
        accessToken: '',
      };
      const userExist = await this.userRepository
        .createQueryBuilder('user')
        .where('user.phone_number = :phone_number', {
          phone_number: loginUserDto.phone_number,
        })
        .getOneOrFail();
      result.accessToken = await this.authService.createJWT(userExist.id);
      result.created = false;
      return result;
    } catch (e) {
      console.log(e);
      let status, error;
      if (e instanceof EntityNotFoundError) {
        status = HttpStatus.NOT_FOUND;
        error = 'NOT_FOUND';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        error = 'INTERNAL_SERVER_ERROR';
      }
      throw new HttpException(
        {
          status: status,
          message: [e.message.split('\n')[0]],
          error: error,
        },
        status,
      );
    }
  }

  async getUserInfo(userId: number): Promise<any> {
    try {
      const userInfo = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :userId', {
          userId: userId,
        })
        .getOne();
      return userInfo;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async requestProtector(userId: number, protectorId: number): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: {
          protectors: true,
        },
      });

      const protector = await this.userRepository.findOne({
        where: {
          id: protectorId,
        },
        relations: {
          wards: true,
        },
      });

      const userProtector = new UserProtector();
      userProtector.protector = protector;
      userProtector.ward = user;

      user.protectors.push(userProtector);
      protector.wards.push(userProtector);

      await this.userRepository.save([user, protector]);
      await this.protectorRepository.save([userProtector]);
      return {
        user: { name: user.name, id: user.id },
        protector: { name: protector.name, id: protector.id },
        accept: userProtector.accept,
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRequestedProtection(userId: number): Promise<any> {
    try {
      const requestedProtectionList = await this.protectorRepository
        .createQueryBuilder('userProtector')
        .leftJoin('userProtector.ward', 'WARD')
        .leftJoin('userProtector.protector', 'PROTECTOR')
        .addSelect('WARD.id')
        .addSelect('WARD.name')
        .addSelect('WARD.phone_number')
        .where('PROTECTOR.id = :id', { id: userId })
        .getMany();
      return requestedProtectionList;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async allowRequestedProtection(userId: number, wardId: number): Promise<any> {
    try {
      console.log(userId, wardId);
      await this.protectorRepository
        .createQueryBuilder()
        .update(UserProtector)
        .set({ accept: true })
        .where('user_protector.protectorId = :userId', { userId })
        .andWhere('user_protector.wardId = :wardId', { wardId })
        .execute();

      const requestedProtection = await this.protectorRepository
        .createQueryBuilder('userProtector')
        .leftJoin('userProtector.ward', 'WARD')
        .leftJoin('userProtector.protector', 'PROTECTOR')
        .addSelect('WARD.id')
        .addSelect('WARD.name')
        .addSelect('WARD.phone_number')
        .addSelect('PROTECTOR.id')
        .addSelect('PROTECTOR.name')
        .addSelect('PROTECTOR.phone_number')
        .where('PROTECTOR.id = :userId', { userId })
        .andWhere('WARD.id = :wardId', { wardId })
        .getOneOrFail();
      return requestedProtection;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProtectorList(wardId: number): Promise<any> {
    try {
      const protectorList = await this.protectorRepository.find({
        relations: {
          protector: true,
        },
        select: {
          request_date: true,
          accept: true,
          protector: {
            id: true,
            name: true,
            phone_number: true,
          },
        },
        where: {
          ward: {
            id: wardId,
          },
          accept: true,
        },
      });
      return protectorList;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
