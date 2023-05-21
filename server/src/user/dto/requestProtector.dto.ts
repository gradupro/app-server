import { IsMobilePhone, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RequestProtectorDTO {
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('ko-KR')
  readonly phone_number: string;
}

export class AllowRequestProtectorDTO {
  @IsNotEmpty()
  @IsNumber()
  readonly wardId: number;
}
