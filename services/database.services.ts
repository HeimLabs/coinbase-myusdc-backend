import mongoose from "mongoose";

let _connection: mongoose.Connection;

const connectToDatabase = async () => {
    console.log("[services/database] 🔄 MongoDB connecting...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("[services/database] ✅ MongoDB connected!");

    _connection = mongoose.connection;
    _connection.on("error", async (err) => {
        console.error(
            "[services/database] ❌ MongoDB connection failed " + err.message
        );
        await connectToDatabase();
    });
    _connection.on("disconnected", async () => {
        console.warn("[services/database] ❌ MongoDB disconnected!");
        await connectToDatabase();
    });

    return _connection;
};

const connection = async () => {
    return _connection;
};

export {
    connectToDatabase,
    connection,
};
