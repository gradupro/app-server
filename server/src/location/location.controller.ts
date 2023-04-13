import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Headers, Res, HttpStatus, Put } from '@nestjs/common';
import { LocationService } from './location.service';
import { SocketGateway } from '../socket/socket.gateway';
import { AuthGuard } from '../auth.guard';
import { Request, Response } from 'express';
import { Message } from '../socket/socket.interface';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService, private readonly socketGateWay: SocketGateway) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Headers() headers: any, @Body() body: any, @Res() res: Response) {
    try {
      const roomName = `${body.reportId}`;
      const createdLocationResult = await this.locationService.create(body);
      const sockets = await this.socketGateWay.server.in(roomName).fetchSockets();
      console.log('sockets', sockets);
      const joinRoomPayload = { userId: headers.user.id, reportId: body.reportId };
      this.socketGateWay.handleSetClientDataEvent(joinRoomPayload);
      const chatPayload: Message = { userId: headers.user.id, message: body.payload, roomName: roomName };
      const message = this.socketGateWay.handleChatEvent(chatPayload);
      console.log('message', message);
      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        data: { message, createdLocationResult },
      });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Put()
  async update(@Headers() headers: any, @Body() body: any, @Res() res: Response) {
    try {
      const roomName = `${body.reportId}`;
      const updatedLocationResult = await this.locationService.update(body);
      const sockets = await this.socketGateWay.server.in(roomName).fetchSockets();
      console.log('sockets', sockets);
      const joinRoomPayload = { userId: headers.user.id, reportId: body.reportId };
      this.socketGateWay.handleSetClientDataEvent(joinRoomPayload);
      const chatPayload: Message = { userId: headers.user.id, message: body.payload, roomName: roomName };
      const message = this.socketGateWay.handleChatEvent(chatPayload);
      console.log('message', message);
      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        data: { message, updatedLocationResult },
      });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }
}
