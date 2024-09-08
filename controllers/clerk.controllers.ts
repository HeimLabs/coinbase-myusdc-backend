import { NextFunction, Response } from "express";
import { ClerkRequest } from "../types/api.types";
import { UserModel } from "../models/User.model";
import { Coinbase } from "@coinbase/coinbase-sdk";
import { coinbase } from "../services";

export async function handleWebhook(req: ClerkRequest, res: Response, next: NextFunction) {
    try {
        if (req.clerkEvent?.type === "user.created") {
            const userData = req.clerkEvent.data;

            // User Setup
            const newUser = await (new UserModel({
                userId: userData.id,
                name: userData.first_name,
                email: userData.primary_email_address_id,
                imageUrl: userData.image_url,
                wallet: {}
            })).save();

            // Wallet Setup
            try {
                const wallet = await coinbase.createWalletForUser(newUser);

                // Fund the wallet
                try {
                    await coinbase.fundWallet(wallet, Coinbase.assets.Usdc);
                } catch (err) {
                    console.error(`[controllers/clerk/handleWebhook] Failed to fund wallet |  User: ${userData.id}`);
                    console.error(err);
                }
            } catch (err) {
                console.error(`[controllers/clerk/handleWebhook] Failed to create wallet |  User: ${userData.id}`);
                console.error(err);
            }
        }

        return res.status(200).json("Success");
    } catch (error) {
        console.error("[controllers/clerk/handleWebhook] Failed to process webhook");
        console.error(error);
        next(error);
    }
}


