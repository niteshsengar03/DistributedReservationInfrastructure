import { z } from "zod";

export const createBookingSchema = z.object({
    userId: z.number({message:"UserID must be present"}),
    hotelId: z.number({message:"hotelId must be present"}),
    totalGuests: z.number({message:"Total guests must be present"}).min(1,{message:"Total guests must be minimum 1"}),
    bookingAmount: z.number({message:"Booking amount must be present"}).min(1,{message:"Booking amount must be greater than 0"})
    , roomCategoryId: z.number({ message: "Room category must be present" }),
    checkInDate: z.string({ message: "Check-in date must be present" }),
    checkOutDate: z.string({ message: "Check-out date must be present" })
})