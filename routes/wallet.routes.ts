import { Router } from "express";
import { getUser, transferAsset, fundWallet, getTransfers } from "../controllers";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const walletRouter = Router();

// @todo - Clerk Auth to User Middleware

walletRouter.get("/user", ClerkExpressRequireAuth(), getUser);
walletRouter.post("/transfer-asset", ClerkExpressRequireAuth(), transferAsset);
walletRouter.post("/fund", ClerkExpressRequireAuth(), fundWallet);
walletRouter.get("/transfers", ClerkExpressRequireAuth(), getTransfers);

export default walletRouter;
