import { Body, Controller, Get, Headers, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestProtectorDTO, AllowRequestProtectorDTO } from './dto/requestProtector.dto';
import { UserService } from './user.service';
import { NaverCloudService } from '../naver-cloud/naver-cloud.service';
import { NotificationDTO } from '../pushNotification/dto/notification.dto';
import { PushNotificationService } from '../pushNotification/pushNotification.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly naverCloudService: NaverCloudService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const signupResult = await this.userService.create(createUserDto);
      return res
        .status(HttpStatus.CREATED)
        .json({ status: HttpStatus.CREATED, data: signupResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const loginResult = await this.userService.login(loginUserDto);
      return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, data: loginResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Get('info')
  async getUserInfo(@Headers() headers: any, @Res() res: Response) {
    try {
      console.log(headers.user);
      const userInfoResult = await this.userService.getUserInfo(headers.user.id);
      return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, data: userInfoResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('protector')
  async requestProtector(
    @Headers() headers: any,
    @Body() requestProtectorDTO: RequestProtectorDTO,
    @Res() res: Response,
  ) {
    try {
      const requestProtectorResult = await this.userService.requestProtector(
        headers.user.id,
        requestProtectorDTO.protectorId,
      );
      const notificationData: NotificationDTO = {
        protectorIds: [requestProtectorDTO.protectorId.toString()],
        requesterName: requestProtectorResult.user.name,
      };
      await this.pushNotificationService.addJob(notificationData);
      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, data: requestProtectorResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Get('protector/request')
  async getRequestProtect(@Headers() headers: any, @Res() res: Response) {
    try {
      const requestProtectionListResult = await this.userService.getRequestedProtection(
        headers.user.id,
      );
      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, data: requestProtectionListResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('protector/allow')
  async allowRequestProtect(
    @Headers() headers: any,
    @Body() allowRequestProtectorDTO: AllowRequestProtectorDTO,
    @Res() res: Response,
  ) {
    try {
      const allowProtectResult = await this.userService.allowRequestedProtection(
        headers.user.id,
        allowRequestProtectorDTO.wardId,
      );
      return res
        .status(HttpStatus.ACCEPTED)
        .json({ status: HttpStatus.ACCEPTED, data: allowProtectResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Get('protector')
  async getProtectors(@Headers() headers: any, @Res() res: Response) {
    try {
      const protectorListResult = await this.userService.getProtectorList(headers.user.id);
      return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, data: protectorListResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Post('device')
  async deviceRegistration(@Headers() headers: any, @Body() body: any, @Res() res: Response) {
    try {
      console.log('deviceRegistration Body', body);
      const userInfoResult = await this.naverCloudService.deviceTokenRegistration(
        headers.user.id,
        body.deviceType,
        body.deviceToken,
      );
      return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, data: userInfoResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }
}
