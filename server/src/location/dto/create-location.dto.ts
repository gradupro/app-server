export class CreateLocationDto {
  reportId: number;
  payload: {
    latitude: number;
    longitude: number;
  };
}
