import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ServerToClientEvents, ClientToServerEvents, Message, JoinRoom } from './socket.interface';
import { Server, Socket } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

@WebSocketGateway(3030, {
  transports: ['websocket'],
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() {}

  @WebSocketServer()
  server: Server = new Server<ServerToClientEvents, ClientToServerEvents>();

  afterInit() {
    instrument(this.server, {
      mode: 'development',
      readonly: true,
      auth: false,
    });
  }
  private logger = new Logger('SocketGateway');

  @SubscribeMessage('chat')
  handleChatEvent(
    @MessageBody()
    payload: Message,
  ): Message {
    this.logger.log(payload);
    this.server.to(payload.roomName).emit('chat', payload);
    return payload;
  }

  @SubscribeMessage('join_room')
  async handleSetClientDataEvent(
    @MessageBody()
    payload: JoinRoom,
  ) {
    const roomName = `${payload.reportId}`;
    if (payload.userId) {
      this.logger.log(`${payload.userId} is joining ${roomName}`);
      this.server.socketsJoin(roomName);
      //const room = this.socketService.addUserToRoom(roomName, payload.userId);
      console.log('addUserToRoom', this.server.sockets.adapter.rooms);
      return roomName;
    } else {
      return roomName;
    }
  }

  async handleConnection(socket: Socket): Promise<void> {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    //await this.socketService.removeUserFromAllRooms(socket.id);
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}
