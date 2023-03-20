import { IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('ko-KR')
  readonly phone_number: string;
}
