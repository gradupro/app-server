import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SendSMSDTO } from './dto/sendSMS.dto';
import { VerifyCodeDTO } from './dto/verifyCode.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('SMS')
  async sendSMS(@Res() res: Response, @Body() sendSMSDTO: SendSMSDTO) {
    try {
      console.log(sendSMSDTO);
      const sendCodeByPhoneNumberResult = await this.authService.sendCodeByPhoneNumber(sendSMSDTO);
      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, data: sendCodeByPhoneNumberResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @Post('code')
  async verifyCode(@Res() res: Response, @Body() verifyCodeDTO: VerifyCodeDTO) {
    try {
      const verifyCodeResult = await this.authService.verifyCode(verifyCodeDTO);
      return res
        .status(HttpStatus.ACCEPTED)
        .json({ status: HttpStatus.ACCEPTED, data: verifyCodeResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }
}
