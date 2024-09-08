import cors from "cors";
import * as express from "express";
import { Express } from "express";

function middlewares(server: Express): Express {
    server.use(cors({ maxAge: 84600 }));
    server.use(express.json());

    return server;
}

export default middlewares;
