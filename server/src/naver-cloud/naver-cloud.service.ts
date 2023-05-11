import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { NotificationDTO } from '../pushNotification/dto/notification.dto';

interface serviceURL {
  SMS: string;
  PUSH_MESSAGE: string;
  DEVICE_TOKEN: string;
}

@Injectable()
export class NaverCloudService {
  private readonly serviceURL: serviceURL;
  constructor(private config: ConfigService) {
    this.serviceURL = {
      SMS: `/sms/v2/services/${this.config.get('NCP_SMS_SERVICEID')}/messages`,
      PUSH_MESSAGE: `/push/v2/services/${this.config.get('NCP_NOTIFICATION_SERVICEID')}/messages`,
      DEVICE_TOKEN: `/push/v2/services/${this.config.get('NCP_NOTIFICATION_SERVICEID')}/users`,
    };
  }

  private makeSignature(url: string, now: number): string {
    const message = [];
    const hmac = crypto.createHmac('sha256', this.config.get('NCP_secretKey'));
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    const timestamp = now;
    message.push(method);
    message.push(space);
    message.push(url);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(this.config.get('NCP_accessKey'));
    //message 배열에 위의 내용들을 담아준 후에
    const signature = hmac.update(message.join('')).digest('base64');
    //message.join('') 으로 만들어진 string 을 hmac 에 담고, base64로 인코딩한다
    return signature.toString(); // toString()이 없었어서 에러가 자꾸 났었는데, 반드시 고쳐야함.
  }

  private makeHeader(serviceURL: string, now: number): any {
    const options = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': this.config.get('NCP_accessKey'),
        'x-ncp-apigw-timestamp': now,
        'x-ncp-apigw-signature-v2': this.makeSignature(serviceURL, now),
      },
    };
    return options;
  }

  async sendSMS(phone_number: string, verify_code: string): Promise<any> {
    try {
      const now = Date.now();
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
      const options = this.makeHeader(this.serviceURL.SMS, now);
      const res = await axios.post(this.config.get('NCP_SMS_URL'), body, options);
      return { status: res.status, response: res.data };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: e.response.data.errors,
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deviceTokenRegistration(
    userId: number,
    deviceType: string,
    deviceToken: string,
  ): Promise<any> {
    try {
      const now = Date.now();
      const body = {
        userId: `${userId}`,
        deviceType: deviceType,
        deviceToken: deviceToken,
        isNotificationAgreement: true,
        isAdAgreement: false,
        isNightAdAgreement: false,
      };
      const options = this.makeHeader(this.serviceURL.DEVICE_TOKEN, now);
      const res = await axios.post(
        this.config.get('NCP_DEVICE_TOKEN_REGISTRATION_URL'),
        body,
        options,
      );
      return { status: res.status, response: res.data };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: e.response.data.errors,
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async pushNotification(data: NotificationDTO): Promise<any> {
    try {
      let message: string;
      if (data.reportType) {
        message = `${data.reporterName}님이 ${data.reportType} 상황으로 도움을 요청하였습니다!`;
      } else {
        message = `${data.requesterName}님이 보호자 요청을 하였습니다.`;
      }
      const now = Date.now();
      const body = {
        messageType: 'NOTIF',
        target: {
          type: 'USER',
          to: data.protectorIds,
        },
        message: {
          default: {
            content: message,
          },
        },
      };
      const options = this.makeHeader(this.serviceURL.PUSH_MESSAGE, now);
      const res = await axios.post(this.config.get('NCP_NOTIFICATION_URL'), body, options);
      return { status: res.status, response: res.data };
    } catch (e) {
      throw new Error(JSON.stringify(e.response.data.error));
    }
  }
}
