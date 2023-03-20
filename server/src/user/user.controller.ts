import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, data: loginResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Get('info')
  async getUserInfo(@Headers() headers: any, @Res() res: Response) {
    try {
      console.log(headers.user);
      const userInfoResult = await this.userService.getUserInfo(
        headers.user.id,
      );
      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, data: userInfoResult });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }
}
