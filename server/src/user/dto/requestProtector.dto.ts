import { IsNotEmpty, IsNumber } from 'class-validator';

export class RequestProtectorDTO {
  @IsNotEmpty()
  @IsNumber()
  readonly protectorId: number;
}

export class AllowRequestProtectorDTO {
  @IsNotEmpty()
  @IsNumber()
  readonly wardId: number;
}
