import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/clerk-sdk-node";

export const clerkWebhookAuth = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const svix_id = request.headers['svix-id'] as string;
        const svix_timestamp = request.headers['svix-timestamp'] as string;
        const svix_signature = request.headers['svix-signature'] as string;

        if (!svix_id || !svix_timestamp || !svix_signature) {
            throw new AppError(400, "error", "Error occured -- no svix headers");
        }

        const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET as string);

        const event = wh.verify(JSON.stringify(request.body), {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;

        request.clerkEvent = event;

        next();
    } catch (err) {
        console.error("[middleware/auth/clerkWebhookAuth] Webhook Auth Failed");
        console.error(err);
        throw new AppError(400, "error", "Webhook Auth Failed");
    }
};

export default {
    clerkWebhookAuth,
};
