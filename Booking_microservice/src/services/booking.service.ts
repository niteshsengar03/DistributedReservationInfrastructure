import {
  confirmBooking,
  createBooking,
  createIdempotencyKey,
  finalzeIdempotencyKey,
  getIdempotencyKeyWithLock,
} from "../repositories/booking.repository";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/errors/app.error";
import { generateIdempotencykey } from "../utils/generateIdempotencykey";
import { CreateBookingDTO } from "../dto/booking.dto";

import primsaClient from "../prisma/client";
import { redlock } from "../config/redis.config";
import serverConfig from "../config";
import { getAvailableRooms, updateBookingIdToRooms } from "../api/hotel.api";


type AvailabeRoom  = {
  id:number,
  roomCategoryId:number,
  dateOfAvailability:Date,
}

// using redis to apply redlock from multiple users while creating Booking for same room
export async function createBookingService(createBookingDTO: CreateBookingDTO) {
  const ttl = serverConfig.LOCK_TTL; // n minutes lock
  const bookingResource = `hotel:${createBookingDTO.hotelId}`;

  const availabeRooms = await getAvailableRooms(
    createBookingDTO.roomCategoryId,
    createBookingDTO.checkInDate,
    createBookingDTO.checkOutDate
  );
  // console.log(availabeRooms);
  const checkOutDate = new Date(createBookingDTO.checkOutDate);
  const checkInDate = new Date(createBookingDTO.checkInDate);
  const totalNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  // console.log(totalNights)
  if (availabeRooms.length === 0 || availabeRooms.length < totalNights) {
    throw new BadRequestError("No rooms available for given dates ");
  }
  let lock;
  try {
    lock = await redlock.acquire([bookingResource], ttl);
    const booking = await createBooking({
      userId: createBookingDTO.userId,
      hotelId: createBookingDTO.hotelId,
      totalGuests: createBookingDTO.totalGuests,
      bookingAmount: createBookingDTO.bookingAmount,
      checkInDate:new Date( createBookingDTO.checkInDate),
      checkOutDate:new Date( createBookingDTO.checkOutDate),
      roomCategoryId: createBookingDTO.roomCategoryId,
    });

    const idempotencyKey = generateIdempotencykey();
    console.log(idempotencyKey);
    await createIdempotencyKey(idempotencyKey, booking.id);

    await updateBookingIdToRooms(booking.id,availabeRooms.data.map((room:AvailabeRoom)=>room.id))

    return {
      bookingId: booking.id,
      idempotencyKey: idempotencyKey,
    };
  } catch (err) {
    console.log(err);
    throw new InternalServerError(
      "Hotel is being booked by someone else. Please try again."
    );
  }
}

// implementing transaction and pestimic lock on row when using getIdempotnecyKey
export async function confrimBookingService(idempotencyKey: string) {
  return primsaClient.$transaction(async (tx) => {
    const idempotencyKeyData = await getIdempotencyKeyWithLock(
      tx,
      idempotencyKey
    );
    // not found check is done in repositroy layer
    if (!idempotencyKeyData) {
      throw new NotFoundError("Idempotency key not found");
    }
    if (idempotencyKeyData.finalized) {
      throw new BadRequestError("Idempotency key is already finalised");
    }

    if (idempotencyKeyData.bookingId === null) {
      throw new NotFoundError(
        "Booking ID not found for the given idempotency key"
      );
    }

    const booking = await confirmBooking(tx, idempotencyKeyData.bookingId);

    await finalzeIdempotencyKey(tx, idempotencyKey);

    return booking;
  });
}
