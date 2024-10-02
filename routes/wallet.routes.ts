import { Router } from "express";
import { getUser, transferAsset, fundWallet, getTransfers, getRecentContacts } from "../controllers";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const walletRouter = Router();

walletRouter.get("/user", ClerkExpressRequireAuth(), getUser);
walletRouter.post("/transfer-asset", ClerkExpressRequireAuth(), transferAsset);
walletRouter.post("/fund", ClerkExpressRequireAuth(), fundWallet);
walletRouter.get("/transfers", ClerkExpressRequireAuth(), getTransfers);
walletRouter.get("/recent-contacts", ClerkExpressRequireAuth(), getRecentContacts);

export default walletRouter;
