import { SocketUser } from './socketUser.entity';

export class Room {
  name: string;
  hostId: number;
  userIds: number[];
}
