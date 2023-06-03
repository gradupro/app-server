import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty()
  @IsInt()
  reportId: number;
  payload: {
    latitude: number;
    longitude: number;
  };
}
