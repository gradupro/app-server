import { CanActivate, Injectable } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { User } from './user/entities/user.entity';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  async canActivate(context: any) {
    console.log(context.args[0].handshake.headers);
    const jwtString = context.args[0].handshake.headers.authorization.split(' ')[1];
    try {
      const { userId } = this.authService.verify(jwtString);
      const user: User = await this.userService.getUserInfo(userId);
      context.args[0].handshake.headers.authorization = user.id;
      return true;
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}
