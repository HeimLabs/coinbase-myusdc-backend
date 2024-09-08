import { Router } from "express";
import { handleWebhook } from "../controllers";
import { clerkWebhookAuth } from "../middlewares/auth";

const clerkRouter = Router();

clerkRouter.post("/webhook", clerkWebhookAuth, handleWebhook);

export default clerkRouter;
