import { Request, Response } from "express";
import { createHotelService, getAllHotelsService, getHotelByIdService, softDeleteHotelService, updateHotelService } from "../service/hotel.service";

export async function createHotelHandler(req:Request,res:Response){
 
    const hotel = await createHotelService(req.body)

     res.status(200).json({
        hotel:hotel
     })
     
}

export async function getHotelByIdHandler(req:Request,res:Response){
   const intId = parseInt(req.params.id,10)
   const hotel = await getHotelByIdService(intId )

   res.status(200).json({
      hotel:hotel
   })
}

export async function getAllHotelsHandler(req:Request,res:Response){
   const hotels = await getAllHotelsService()
   res.status(200).json({
      hotels:hotels
   })
}

// export async function deleteHotelHandler(req:Request,res:Response){
//    const hotel = await deleteHotelService(parseInt(req.params.id))
//    res.status(200).json({
//       message:"success",
//       hotel
//    })
// }

export async function updateHotelHandler(req:Request,res:Response){
   const intId = parseInt(req.params.id,10)
   const hotelData = req.body;
   const hotel = await updateHotelService(intId,hotelData);
   res.status(200).json({
      message:"success",
      hotel
   })
}

export async function softDeleteHotelHandler(req:Request,res:Response){
    const intId = parseInt(req.params.id,10)
   const deleted= await softDeleteHotelService(intId)

    res.status(200).json({
      success: deleted
    })
}
