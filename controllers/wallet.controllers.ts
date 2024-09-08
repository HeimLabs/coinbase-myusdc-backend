import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
// import { wallet as CoinbaseWallet } from "../services/coinbase.services";
import { AssetTransferRequest } from "types/api.types";
import { Coinbase } from "@coinbase/coinbase-sdk";

export async function getWallet(req: Request, res: Response, next: NextFunction) {
    try {
        // const addressData = CoinbaseWallet.getDefaultAddress();

        // return res.status(200).json({
        //     address: addressData?.getId(),
        //     chain: addressData?.getNetworkId()
        // });
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

