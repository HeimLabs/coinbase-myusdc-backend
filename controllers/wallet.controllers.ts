import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { AssetTransferRequest } from "types/api.types";
import { Coinbase } from "@coinbase/coinbase-sdk";
import { UserModel } from "../models/User.model";
import { coinbase } from "../services";

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        let user = await UserModel.findOne({ userId: req.auth.userId });

        if (!user)
            throw new AppError(404, "error", "User not found");

        // @review - If user doesn't exist? Create User?
        // @review - ONLY Create user here instead of webhook?
        
        // If wallet doesn't exist, create wallet
        if (!user.wallet) {
            try {
                const wallet = await coinbase.createWalletForUser(user);

                // Fund the wallet
                try {
                    await coinbase.fundWallet(wallet, Coinbase.assets.Usdc);
                } catch (err) {
                    console.error(`[controllers/wallet/getUser] Failed to fund wallet |  User: ${user.userId}`);
                    console.error(err);
                }
            } catch (err) {
                console.error(`[controllers/wallet/getUser] Failed to create wallet |  User: ${user.userId}`);
                console.error(err);
            }
        }

        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

export async function transferAsset(req: AssetTransferRequest, res: Response, next: NextFunction) {
    try {
        // @todo - validate data
        const { token, data } = req.body;
        const { wallet, amount } = data;

        if (!token || !data || !wallet || !amount)
            throw new AppError(400, "error", "Invalid request");

        if (token == Coinbase.assets.Usdc) {
            // const balance = await CoinbaseWallet.getBalance(token);
            // if (balance.lessThan(amount))
            //     throw new AppError(400, "error", "Insufficient balance");
        }
        else {
            throw new AppError(400, "error", "Unsupported token");
        }

        // const transfer = await CoinbaseWallet.createTransfer({
        //     amount: parseFloat(amount),
        //     assetId: token,
        //     destination: wallet,
        //     gasless: token == Coinbase.assets.Usdc ? true : false
        // });

        return res.status(200).json({
            // transactionLink: transfer.getTransactionLink(),
            // status: transfer.getStatus()
        });
    } catch (error) {
        next(error);
    }
}

