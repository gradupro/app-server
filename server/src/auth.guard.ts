import { Request } from 'express';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user/entities/user.entity';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const userId = this.validateRequest(request);
      const user: User = await this.userService.getUserInfo(userId);
      if (!user) {
        return false;
      }
      request.headers.user = { id: user.id };
      return true;
    } catch (e) {
      throw e;
    }
  }

  private validateRequest(request: Request) {
    try {
      const jwtString = request.headers.authorization.split('Bearer ')[1];
      const { userId } = this.authService.verify(jwtString);
      return userId;
    } catch (e) {
      if (e instanceof TypeError) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            message: ["No 'Authorization' Header Found"],
            error: 'UNAUTHORIZED',
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        throw e;
      }
    }
  }
}
