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

@Injectable()
export class AuthService {
  constructor(
    @Inject('VERIFY_REPOSITORY')
    private verifyRepository: Repository<Verify>,
    private config: ConfigService,
  ) {}

  private makeSignature(): string {
    const message = [];
    const hmac = crypto.createHmac('sha256', this.config.get('NCP_secretKey'));
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    const timestamp = Date.now().toString();
    const uri = this.config.get('NCP_serviceId');
    message.push(method);
    message.push(space);
    message.push(`/sms/v2/services/${uri}/messages`);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(this.config.get('NCP_accessKey'));
    //message 배열에 위의 내용들을 담아준 후에
    const signature = hmac.update(message.join('')).digest('base64');
    //message.join('') 으로 만들어진 string 을 hmac 에 담고, base64로 인코딩한다
    return signature.toString(); // toString()이 없었어서 에러가 자꾸 났었는데, 반드시 고쳐야함.
  }

  private async sendSMS(
    phone_number: string,
    verify_code: string,
  ): Promise<any> {
    const body = {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: this.config.get('hostPhoneNumber'), // 발신자 번호
      content: `인증 번호는 ${verify_code}입니다.`,
      messages: [
        {
          to: phone_number, // 수신자 번호
        },
      ],
    };
    const options = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': this.config.get('NCP_accessKey'),
        'x-ncp-apigw-timestamp': Date.now().toString(),
        'x-ncp-apigw-signature-v2': this.makeSignature(),
      },
    };
    axios
      .post(this.config.get('NCP_URL'), body, options)
      .then(async (res) => {
        // 성공 이벤트
        return { status: res.status, response: res.data };
      })
      .catch((err) => {
        console.error(err);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: ['INTERNAL_SERVER_ERROR'],
            error: 'INTERNAL_SERVER_ERROR',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  async sendCodeByPhoneNumber(sendSMSDTO: SendSMSDTO): Promise<any> {
    try {
      const verify_code = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const createdVerify = await this.verifyRepository
        .createQueryBuilder()
        .insert()
        .into(Verify)
        .values([{ code: verify_code, phone_number: sendSMSDTO.phone_number }])
        .execute();
      const sendSMSResult = await this.sendSMS(
        sendSMSDTO.phone_number,
        verify_code,
      );
      return { createdVerify: createdVerify, sendSMSResult: sendSMSResult };
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
          status: status,
          message: [e.message.split('\n')[0]],
          error: error,
        },
        status,
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
