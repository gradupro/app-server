import { Point } from 'wkx';
import { User } from '../user/entities/user.entity';

export interface Room {
  name: string;
  host: User;
  users: User[];
}

export interface JoinRoom {
  reportId: number;
  userId: number;
}

export interface Message {
  userId: number;
  body: Object;
  roomName: string;
}

export interface ServerToClientEvents {
  chat: (e: Message) => void;
}

export interface ClientToServerEvents {
  chat: (e: Message) => void;
  join_room: (e: { user: User; roomName: string }) => void;
}
