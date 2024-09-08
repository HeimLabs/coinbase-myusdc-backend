import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { Request } from "express"

export type NODE_ENV = "development" | "production";

export type Status = "idle" | "loading" | "success" | "fail" | "error";

export type TransferData = {
    wallet: string;
    amount: string;
};

export type AssetTransferBody = {
    token: string,
    data: TransferData
};

export type AssetTransferRequest = Request<{}, {}, AssetTransferBody>;

export type ClerkRequest = Request & { clerkEvent?: WebhookEvent }