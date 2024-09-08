import { Router } from "express";
import { getWallet, transferAsset } from "../controllers";

const walletRouter = Router();

walletRouter.get("/", getWallet);
walletRouter.post("/transfer-asset", transferAsset);

export default walletRouter;
