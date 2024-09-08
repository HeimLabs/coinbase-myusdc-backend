import "dotenv/config";
import middlewares from "./middlewares";
import router from "./routes";
import express from "express";
import { database } from "./services";
import { ServerSigner } from "@coinbase/coinbase-sdk";

const start = async () => {
    let app = express();

    app = middlewares(app);
    app.use(router);

    await database.connectToDatabase();

    app.listen(process.env.PORT || 5000, async () => {
        try {
            console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
            if (await ServerSigner.getDefault())
                console.log("✅ Coinbase ServerSigner connected!");
        } catch (error) {
            console.log("❌ Coinbase ServerSigner failed to connect!");
            await gracefulShutdown();
        }
    });
}

async function gracefulShutdown() {
    try {
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

start();