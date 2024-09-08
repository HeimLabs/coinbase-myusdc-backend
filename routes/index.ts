import { Router } from "express";
import { errorHandler, healthCheck, notFound } from "../controllers";
import walletRouter from "./wallet.routes";
import clerkRouter from "./clerk.routes";

const router = Router();

router.get("/", healthCheck);

router.use("/wallet", walletRouter);
router.use("/clerk", clerkRouter);

router.all("*", notFound);

router.use(errorHandler);

export default router;
