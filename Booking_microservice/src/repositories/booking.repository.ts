import { Prisma, IdempotencyKey } from "@prisma/client";
import prismaClient from "../prisma/client";
import { validate as isValidUUID } from "uuid";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";

export async function createBooking(bookingInput: Prisma.BookingCreateInput) {
    // console.log(bookingInput);
    const booking = await prismaClient.booking.create({
        data: bookingInput
    });
    return booking;
}


export async function createIdempotencyKey(key: string, bookingId: number) {
    const idempotencyKey = await prismaClient.idempotencyKey.create({
        data: {
            idemKey: key,
            booking: {
                connect: {
                    id: bookingId
                }
            }
        }
    })
    // console.log("HIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII")
    // console.log(idempotencyKey)
    return idempotencyKey;
}

export async function getIdempotencyKeyWithLock(tx: Prisma.TransactionClient, key: string) {
    // to avoid sql injection
    if (!isValidUUID(key))
        throw new BadRequestError('Invalid idempotency key format');

    // creating a lock on row using for update wich is a pestimic locking
    const idempotencyKey: Array<IdempotencyKey> = await tx.$queryRaw(Prisma.raw(`
    SELECT * FROM IdempotencyKey WHERE idemKey='${key}' FOR UPDATE
    `))


    // can't return whole array
    if (!idempotencyKey || idempotencyKey.length === 0)
        throw new NotFoundError('Idempotency key not found');

    return idempotencyKey[0];
}

export async function getBookingById(bookingId: number) {
    const booking = await prismaClient.booking.findUnique({
        where: {
            id: bookingId
        }
    })
    return booking;
}






// tickect -> pending -> confirmed
//  or                -> cancelled
// or       -> pending -> confirmed -> cancelled

//  confirmBooking and cancelBooking function should we call wisely and service layer is responsible for it
export async function confirmBooking(tx: Prisma.TransactionClient, bookingId: number) {
    const booking = await tx.booking.update({
        where: {
            id: bookingId
        },
        data: {
            status: "CONFIRMED"
        }
    })
    return booking;
}

export async function cancelBooking(bookingId: number) {
    const booking = await prismaClient.booking.update({
        where: {
            id: bookingId
        },
        data: {
            status: "CANCELLED"
        }
    })
    return booking;
}



export async function finalzeIdempotencyKey(tx: Prisma.TransactionClient, key: string) {
    const idempotencyKey = await tx.idempotencyKey.update({
        where: {
            idemKey: key
        },
        data: {
            finalized: true
        }
    });
    return idempotencyKey;
}