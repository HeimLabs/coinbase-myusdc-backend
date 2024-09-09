import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { Request } from "express"

export type NODE_ENV = "development" | "production";

export type Status = "idle" | "loading" | "success" | "fail" | "error";

export type TransferData = {
    recipient: string;
    amount: string;
};

export type AssetTransferBody = {
    asset: string,
    data: TransferData
};

export type AssetTransferRequest = Request<{}, {}, AssetTransferBody>;

export type ClerkEventProp = { clerkEvent?: WebhookEvent };