import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User, userToken } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
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
      result.accessToken = await this.authService.createJWT(createdUser.raw.id);
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
}
