import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateLocationDto {
  @IsNotEmpty()
  @IsInt()
  reportId: number;
  payload: {
    latitude: number;
    longitude: number;
  };
}
