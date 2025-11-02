import { Prisma, rooms } from "@prisma/client";
import logger from "../config/logger.config";
import { CreateRoomDTO } from "../DTO/room.dto";
import prisma from "../prisma/client";
import { InternalServerError, NotFoundError } from "../utils/errors/app.error";

// Create Room
export async function createRoom(roomData: CreateRoomDTO) {
  const room = await prisma.rooms.create({
    data: roomData,
  });
  logger.info(`Room created: ${room.id}`);
  return room;
}

// Get Room by ID
export async function getRoomById(id: number) {
  const room = await prisma.rooms.findUnique({
    where: { id },
  });

  //   if (!room || room.deleted_at) {
  //     throw new NotFoundError(`Room with ID ${id} not found`);
  //   }

  return room;
}

// Get All Rooms
export async function getAllRooms() {
  const rooms = await prisma.rooms.findMany({
    where: {
      deleted_at: null,
    },
  });

  if (!rooms.length) {
    throw new NotFoundError("No Rooms found");
  }

  return rooms;
}

// Soft Delete Room
export async function softDeleteRoom(id: number) {
  const result = await prisma.rooms.updateMany({
    where: { id, deleted_at: null },
    data: { deleted_at: new Date() },
  });

  if (result.count === 0) {
    throw new InternalServerError("Soft delete failed — no rows affected.");
  }

  logger.info(`Room soft deleted: ${id}`);
  return true;
}

export async function findByRoomCategoryIdAndDate(
  roomCategoryId: number,
  currentDate: Date
) {
  return prisma.rooms.findFirst({
    where: {
      room_category_id: roomCategoryId,
      date_of_availability: currentDate,
      deleted_at: null,
    },
  });
}

export async function bulkCreate(rooms:Prisma.roomsCreateManyInput[]){
  return await prisma.rooms.createMany({data:rooms})
}

export async function findLatestDateByRoomCategoryId(roomCategoryId: number) {
  const room = await prisma.rooms.findFirst({
    where: {
      room_category_id: roomCategoryId,
      deleted_at: null,
    },
    orderBy: {
      date_of_availability: 'desc'
    },
    select: {
      date_of_availability: true
    }
  });
  return room?.date_of_availability;
}


export async function findLatestDatesForAllCategories() {
  const groups = await prisma.rooms.groupBy({
    by: ["room_category_id"],
    where: {
      deleted_at: null,
    },
    _max: {
      date_of_availability: true,
    },
  });

  return groups
    .filter(g => g._max.date_of_availability !== null)   // remove null rows
    .map(g => ({
      roomCategoryId: g.room_category_id,
      latestDate: new Date(g._max.date_of_availability!)  // guaranteed non-null
    }));
}
