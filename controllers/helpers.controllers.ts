import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";

import { JwtHeader, SignOptions, sign } from "jsonwebtoken";
import crypto from "crypto";

function errorHandler(
    err: Error | AppError,
    _req: Request,
    res: Response,
    next: NextFunction
) {
    if (err) {
        let status = 200;
        if (err instanceof AppError) status = err.statusCode;
        else status = res.statusCode == 200 ? 500 : res.statusCode;
        const message = err?.message || "Something went wrong";
        res.status(status).json(message);
    } else next();
}

function healthCheck(_req: Request, res: Response) {
    res.status(200).send("OK");
}

function notFound(_req: Request, res: Response) {
    res.status(404).send("Not found");
}

export type CreateCoinbaseRequestParams = {
    request_method: "GET" | "POST";
    request_path: string;
};

async function createCoinbaseRequest({
    request_method,
    request_path,
}: CreateCoinbaseRequestParams) {
    const key = await import("../cdp_api_key.json");
    const key_name = key.name;
    const key_secret = key.privateKey;
    const host = "api.developer.coinbase.com";

    const url = `https://${host}${request_path}`;
    const uri = `${request_method} ${host}${request_path}`;

    const payload = {
        iss: "coinbase-cloud",
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 120,
        sub: key_name,
        uri,
    };

    const signOptions: SignOptions = {
        algorithm: "ES256",
        header: {
            kid: key_name,
            // @ts-ignore
            nonce: crypto.randomBytes(16).toString("hex"), // non-standard, coinbase-specific header that is necessary
        },
    };

    const jwt = sign(payload, key_secret, signOptions);

    return { url, jwt };
}

type FetchOnrampRequestParams = {
    request_method: "GET" | "POST";
    url: string;
    jwt: string;
    body?: string;
    res: Response;
};

interface JsonResponse {
    message?: string;
    [key: string]: any; // This allows for additional properties in the response
}

async function fetchCoinbaseRequest({
    request_method,
    url,
    jwt,
    body,
    res,
}: FetchOnrampRequestParams) {
    await fetch(url, {
        method: request_method,
        body: body,
        headers: { Authorization: "Bearer " + jwt },
    })
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            const parsedJson = json as JsonResponse;
            if (parsedJson.message) {
                console.error("Error:", parsedJson.message);
                res.status(500).json({ error: parsedJson.message });
            } else {
                res.status(200).json(json);
            }
        })
        .catch((error) => {
            console.log("Caught error: ", error);
            res.status(500);
        });
}

export { errorHandler, healthCheck, notFound, createCoinbaseRequest, fetchCoinbaseRequest };
