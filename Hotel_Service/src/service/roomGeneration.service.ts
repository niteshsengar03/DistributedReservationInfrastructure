import { Prisma, room_categories } from "@prisma/client";
import {
  bulkCreate,
  findByRoomCategoryIdAndDate,
} from "../repositories/room.repository";
import { getRoomCateogoryById } from "../repositories/roomCategory.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { RoomGenerationJob } from "../validator/roomGeneration.validator";
import logger from "../config/logger.config";

export async function generateRooms(jobData: RoomGenerationJob) {
  let totalRoomsCreated = 0;
  let totalDatesProcessed = 0;
  const roomCategory = await getRoomCateogoryById(jobData.roomCategoryId);
  if (!roomCategory) {
    throw new NotFoundError(
      `Room Category with ${jobData.roomCategoryId} not found`
    );
  }

  const startDate = new Date(jobData.startDate);
  const endDate = new Date(jobData.endDate);
  if (startDate > endDate)
    throw new BadRequestError(`Start Date must be before end date`);
  if (startDate < new Date())
    throw new BadRequestError(`Start date cannot be in past`);

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  logger.info(`Generating rooms for ${totalDays} days`);
  const batchSize = jobData.batchSize || 100;

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // create batch end as inclusive last day of batch
    const batchEndDate = new Date(currentDate);
    batchEndDate.setDate(batchEndDate.getDate() + batchSize - 1);

    // if batch end exceeds overall endDate, cap it to endDate
    if (batchEndDate > endDate) {
      // assign a copy of endDate to avoid setDate misuse
      batchEndDate.setTime(endDate.getTime());
    }

    logger.info(
      `Processing batch from ${currentDate.toISOString().split("T")[0]} to ${batchEndDate
        .toISOString()
        .split("T")[0]}`
    );

    const batchResult = await processDateBatch(
      roomCategory,
      new Date(currentDate),
      new Date(batchEndDate),
      jobData.priceOverride
    );

    totalRoomsCreated += batchResult.roomCreated;
    totalDatesProcessed += batchResult.dateProcessed;

    // advance currentDate to the day after batchEndDate
    currentDate = new Date(batchEndDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  logger.info(
    `Room generation completed. roomsCreated=${totalRoomsCreated} datesProcessed=${totalDatesProcessed}`
  );

  return {
    totalRoomsCreated,
    totalDatesProcessed,
  };
}
// process date in batches
export async function processDateBatch(
roomCategory: room_categories,
  startDate: Date,
  endDate: Date,
  priceOverride?: number
) {
  let roomCreated = 0;
  let dateProcessed = 0;
  const roomsToCreate: Prisma.roomsCreateManyInput[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const existingRoom = await findByRoomCategoryIdAndDate(
      roomCategory.id,
      new Date(currentDate)
    );

    if (!existingRoom) {
      roomsToCreate.push({
        hotel_id: roomCategory.hotel_id,
        room_category_id: roomCategory.id,
        date_of_availability: new Date(currentDate),
        price: priceOverride || roomCategory.price,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
    dateProcessed++;
  }

  logger.info(
    `Batch result: toCreate=${roomsToCreate.length} for category=${roomCategory.id}`
  );

  if (roomsToCreate.length > 0) {
    await bulkCreate(roomsToCreate);
    roomCreated += roomsToCreate.length;
    logger.info(`Inserted ${roomsToCreate.length} rooms`);
  }

  return {
    roomCreated,
    dateProcessed,
  };
}
