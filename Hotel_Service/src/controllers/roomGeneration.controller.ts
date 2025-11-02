import { Request, Response } from "express";
import { addRoomGernerationJobToQueue } from "../producers/roomGeneration.producer";


export async function generateRoomHandler(req: Request, res: Response) {

    await addRoomGernerationJobToQueue(req.body);
    res.status(200).json({
        message: "Room generation job add to queue",
        success: true,
        data: {},
    })
}