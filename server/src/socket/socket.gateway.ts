import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket } from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { ServerToClientEvents, ClientToServerEvents, Message, JoinRoom } from './socket.interface';
import { Server, Socket } from 'socket.io';

import { SocketService } from './socket.service';
import { WsGuard } from '../ws.guard';

@WebSocketGateway(3030, {
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private socketService: SocketService) {}

  @WebSocketServer() server: Server = new Server<ServerToClientEvents, ClientToServerEvents>();

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
    console.log(payload);
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
