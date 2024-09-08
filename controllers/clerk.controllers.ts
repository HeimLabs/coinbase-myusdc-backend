import { NextFunction, Response } from "express";
import { ClerkRequest } from "../types/api.types";
import { UserModel } from "../models/User.model";

export async function handleWebhook(req: ClerkRequest, res: Response, next: NextFunction) {
    const session = await UserModel.startSession();
    try {
        if (req.clerkEvent?.type === "user.created") {
            const userData = req.clerkEvent.data;
            await (new UserModel({
                userId: userData.id,
                name: userData.first_name,
                email: userData.primary_email_address_id,
                imageUrl: userData.image_url,
                wallet: {}
            }, session)).save();

            // TODO: Wallet Setup
        }
    } catch (error) {
        console.error("[controllers/clerk/handleWebhook] Failed to process webhook");
        console.error(error);
        next(error);
    }
    finally {
        await session.endSession()
    }
}


