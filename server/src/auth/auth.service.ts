import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SendSMSDTO } from './dto/sendSMS.dto';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Verify } from './entities/auth.entity';
import { VerifyCodeDTO } from './dto/verifyCode.dto';
import { User } from '../user/entities/user.entity';
import { NaverCloudService } from '../naver-cloud/naver-cloud.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('VERIFY_REPOSITORY')
    private verifyRepository: Repository<Verify>,
    private config: ConfigService,
    private naverCloudService: NaverCloudService,
  ) {}

  async sendCodeByPhoneNumber(sendSMSDTO: SendSMSDTO): Promise<any> {
    try {
      const verify_code = Math.floor(100000 + Math.random() * 900000).toString();
      const createdVerify = await this.verifyRepository
        .createQueryBuilder()
        .insert()
        .into(Verify)
        .values([{ code: verify_code, phone_number: sendSMSDTO.phone_number }])
        .execute();
      const sendSMSResult = await this.naverCloudService.sendSMS(
        sendSMSDTO.phone_number,
        verify_code,
      );
      return { createdVerify: createdVerify, sendSMSResult: sendSMSResult };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [...e.response.message],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyCode(verifyCodeDTO: VerifyCodeDTO): Promise<Verify> {
    try {
      const codeExist = await this.verifyRepository
        .createQueryBuilder('verify')
        .where('verify.phone_number = :phone_number', {
          phone_number: verifyCodeDTO.phone_number,
        })
        .andWhere('verify.code = :code', { code: verifyCodeDTO.code })
        .getOneOrFail();
      console.log(codeExist);
      await this.verifyRepository
        .createQueryBuilder('verify')
        .delete()
        .where('id = :id', { id: codeExist.id })
        .execute();
      return codeExist;
    } catch (e) {
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
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [...e.response.message],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createJWT(userId: number): Promise<string> {
    const payload = { id: userId };

    return jwt.sign(payload, this.config.get('secret'), {
      expiresIn: '1y',
    });
  }

  verify(jwtString: string) {
    try {
      const payload = jwt.verify(jwtString, this.config.get('secret')) as (
        | jwt.JwtPayload
        | string
      ) &
        User;

      const { id } = payload;

      return {
        userId: id,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: ['User Not Found By JWT'],
          error: 'UNAUTHORIZED',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
