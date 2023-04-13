import { Injectable } from '@nestjs/common';
import { Room } from './entities/room.entity';
import { SocketUser } from './entities/socketUser.entity';
import { UserService } from '../user/user.service';
import { ReportService } from '../report/report.service';
import { LocationService } from '../location/location.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SocketService {
  constructor(private userService: UserService, private reportService: ReportService, private locationService: LocationService) {}
  private rooms: Room[] = [];

  addRoom(roomName: string, hostId: number): void {
    if (!hostId) {
      throw 'The host user with which you are attempting to create a new room does not exist';
    }
    console.log(this.rooms);
    const room = this.getRoomIndexByName(roomName);
    if (room === -1) {
      const newRoom = new Room();
      newRoom.name = roomName;
      newRoom.hostId = hostId;
      newRoom.userIds = [hostId];
      this.rooms.push(newRoom);
    }
  }

  async removeRoom(roomName: Room['name']): Promise<void> {
    const roomIndex = this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'The room which you are attempting to remove does not exist';
    }
    this.rooms.splice(roomIndex, 1);
  }

  getRoomHost(roomName: string): number {
    const roomIndex = this.getRoomIndexByName(roomName);
    return this.rooms[roomIndex].hostId;
  }

  getRoomIndexByName(roomName: Room['name']): number {
    const roomIndex = this.rooms.findIndex((room) => room.name === roomName);
    return roomIndex;
  }

  async getRoomByName(roomName: Room['name']): Promise<Room | 'Not Exists'> {
    const findRoom = this.rooms.find((room) => room.name === roomName);
    if (!findRoom) {
      return 'Not Exists';
    }
    return findRoom;
  }

  addUserToRoom(roomName: string, userId: number): Room {
    const roomIndex = this.getRoomIndexByName(roomName);
    if (!userId) {
      throw 'The user which you are attempting to add to a room does not exist';
    }
    if (roomIndex !== -1) {
      this.rooms[roomIndex].userIds.push(userId);
      const host = this.getRoomHost(roomName);
      if (host === userId) {
        this.rooms[roomIndex].hostId = userId;
      }
    } else {
      this.addRoom(roomName, userId);
    }
    return this.rooms[roomIndex];
  }

  async getRoomsByUserSocketId(userId: number): Promise<Room[]> {
    const filteredRooms = this.rooms.filter((room) => {
      const found = room.userIds.find((id) => id === userId);
      if (found) {
        return found;
      }
    });
    return filteredRooms;
  }

  /*
  async getFirstInstanceOfUser(socketId: SocketUser['socketId']): Promise<SocketUser> {
    const findRoomsWithUser = await this.getRoomsByUserSocketId(socketId);
    if (findRoomsWithUser.length === 0) {
      throw 'Cound not find any rooms that contain that user';
    }
    const findUserInRoom = findRoomsWithUser[0].users.find((user) => user.socketId === socketId);
    if (!findUserInRoom) {
      throw 'could not find user in that room';
    }
    return findUserInRoom;
  }
  */

  async removeUserFromAllRooms(userId: number): Promise<void> {
    const rooms = await this.getRoomsByUserSocketId(userId);
    for (const room of rooms) {
      await this.removeUserFromRoom(userId, room.name);
    }
  }

  async removeUserFromRoom(userId: number, roomName: Room['name']): Promise<void> {
    const roomIndex = this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'The room which you attempted to remove a user from does not exist';
    }
    const userIndex = this.getUserIndexFromRoomBySocketId(userId, roomIndex);
    if (userIndex === -1) {
      throw 'The user which you attempted to remove from a room does not exist in that room';
    }
    this.rooms[roomIndex].userIds.splice(userIndex, 1);
    if (this.rooms[roomIndex].userIds.length === 0) {
      await this.removeRoom(roomName);
    }
  }

  getUserIndexFromRoomBySocketId(userId: number, roomIndex: number): number {
    const userIndex = this.rooms[roomIndex].userIds.findIndex((id) => id === userId);
    return userIndex;
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms;
  }
}
