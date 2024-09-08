import { Router } from "express";
import { getUser, transferAsset } from "../controllers";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const walletRouter = Router();

walletRouter.get("/user", ClerkExpressRequireAuth(), getUser);
walletRouter.post("/transfer-asset", transferAsset);

export default walletRouter;
