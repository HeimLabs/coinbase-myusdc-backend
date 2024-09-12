import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { AssetTransferRequest, FundWalletRequest } from "types/api.types";
import { Coinbase, ExternalAddress, Wallet } from "@coinbase/coinbase-sdk";
import { UserDocument, UserModel } from "../models/User.model";
import { coinbase } from "../services";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { faucetConfig } from "../config";

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        let user = await UserModel.findOne({ userId: req.auth.userId });

        const _user = await clerkClient.users.getUser(req.auth.userId);

        // @todo - Update reward

        // If user doesn't exist, create user
        if (!user) {
            user = await (new UserModel({
                userId: _user.id,
                name: (_user.firstName || "") + (_user.lastName ? " " + _user.lastName : ""),
                email: _user.primaryEmailAddress?.emailAddress,
                imageUrl: _user.imageUrl,
                wallet: {},
                faucet: {}
            })).save();
        }

        // If wallet doesn't exist, create wallet
        if (!user.wallet?.id) {
            try {
                const wallet = await coinbase.createWalletForUser(user);
                const address = (await wallet.getDefaultAddress()).getId()

                // Fund the wallet
                try {
                    await coinbase.fundWallet(address, Coinbase.assets.Usdc, faucetConfig.INITIAL_AMOUNT);
                } catch (err) {
                    console.error(`[controllers/wallet/getUser] Failed to fund wallet |  User: ${user?.userId}`);
                    console.error(err);
                }
            } catch (err) {
                console.error(`[controllers/wallet/getUser] Failed to create wallet |  User: ${user?.userId}`);
                console.error(err);
            }
        }
        // Else, fetch wallet balance
        else {
            try {
                const address = new ExternalAddress(
                    process.env.APP_ENV === "production"
                        ? Coinbase.networks.BaseMainnet
                        : Coinbase.networks.BaseSepolia,
                    user.wallet.address as string
                );
                const usdcBalance = (await address.getBalance(Coinbase.assets.Usdc)).toNumber();
                user = {
                    ...user.toJSON(),
                    wallet: {
                        ...user.wallet,
                        usdcBalance: usdcBalance
                    }
                } as any;
            } catch (err) {
                console.error(`[controllers/wallet/getUser] Failed to fetch balance |  User: ${user?.userId}`);
                console.error(err);
            }
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(`[controllers/wallet/getUser] Failed to get user`);
        console.error(error);
        next(error);
    }
}

export async function transferAsset(req: AssetTransferRequest, res: Response, next: NextFunction) {
    try {
        const { asset, data } = req.body;
        const { recipient, amount } = data;

        // @todo - transfer to email/address

        let user = await UserModel.findOne({ userId: req.auth.userId });
        let destination = await UserModel.findOne({ email: recipient });

        if (!user)
            throw new AppError(404, "error", "User not found");
        if (!user.wallet?.id)
            throw new AppError(404, "error", "Wallet not found");
        if (!asset || !data || !recipient || !amount)
            throw new AppError(400, "error", "Invalid request");

        const wallet = await Wallet.fetch(user.wallet?.id);

        if (asset == Coinbase.assets.Usdc) {
            const balance = await wallet.getBalance(asset);
            if (balance.lessThan(amount))
                throw new AppError(400, "error", "Insufficient balance");
        }
        else {
            throw new AppError(400, "error", "Unsupported asset");
        }

        const transfer = await (await wallet.createTransfer({
            amount: amount,
            assetId: asset,
            destination: destination && destination.wallet?.address
                ? destination.wallet?.address
                : recipient,
            gasless: asset == Coinbase.assets.Usdc ? true : false,
        })).wait({ timeoutSeconds: 30 });

        return res.status(200).json({
            transactionLink: transfer.getTransactionLink(),
            status: transfer.getStatus()
        });
    } catch (error) {
        console.error("[controllers/wallet/transferAsset] Transfer Failed: ", error);
        next(error);
    }
}

export async function fundWallet(req: FundWalletRequest, res: Response, next: NextFunction) {
    try {
        const { asset, amount } = req.body;

        if (!amount || !asset || amount > faucetConfig.MAX_REQUEST_AMOUNT)
            throw new AppError(400, "error", "Invalid request");

        let user = await UserModel.findOne({ userId: req.auth.userId });

        if (!user || !user.wallet?.id)
            throw new AppError(404, "error", "User not found");

        if ((user.faucet.amount + amount) > faucetConfig.MAX_TOTAL_AMOUNT)
            throw new AppError(400, "error", "Limit exceeded");

        if ((user.wallet.usdBalance - amount) <= 0)
            throw new AppError(400, "error", "Insufficient USD");

        if (user.faucet.lastRequested) {
            const now = new Date();
            const timeSinceLastRequest = (now.getTime() - user.faucet.lastRequested?.getTime()) / 1000;
            if (timeSinceLastRequest < faucetConfig.MIN_REQUEST_INTERVAL)
                throw new AppError(400, "error", "Too many requests");
        }

        if (!Object.values(Coinbase.assets).includes(asset))
            throw new AppError(400, "error", "Asset not supported");

        await coinbase.fundWallet(user.wallet.address as string, asset, amount);

        user.wallet.usdBalance -= amount;
        user.faucet.lastRequested = new Date();
        await user.save();

        return res.status(200).json(user);
    } catch (error) {
        console.error("[controllers/wallet/fundWallet] Funding Failed: ", error);
        next(error);
    }
}

export async function getTransfers(req: Request, res: Response, next: NextFunction) {
    try {
        let user = await UserModel.findOne({ userId: req.auth.userId });

        if (!user)
            throw new AppError(404, "error", "User not found");
        if (!user.wallet?.id)
            throw new AppError(404, "error", "Wallet not found");

        const wallet = await Wallet.fetch(user.wallet?.id);
        const address = await wallet.getDefaultAddress();
        const _transfers = await address.listTransfers();

        const transfers = [];
        const addressUserMap = new Map();

        for await (const transfer of _transfers) {
            const destinationAddress = transfer.getDestinationAddressId();
            let destinationUser: UserDocument | null;

            if (addressUserMap.has(destinationAddress)) {
                destinationUser = addressUserMap.get(destinationAddress);
            } else {
                destinationUser = await UserModel.findOne({ 'wallet.address': { $regex: new RegExp(destinationAddress, 'i') } });
                addressUserMap.set(destinationAddress, destinationUser);
            }

            transfers.push({
                id: transfer.getId(),
                destinationAddress: transfer.getDestinationAddressId(),
                destinationUser: destinationUser ? destinationUser : null,
                assetId: transfer.getAssetId(),
                amount: transfer.getAmount().toNumber(),
                transactionLink: transfer.getTransactionLink(),
                status: transfer.getStatus()
            });
        }

        return res.status(200).json({ transfers: transfers.reverse() });
    } catch (error) {
        console.error(`[controllers/wallet/getTransfers] Failed to get transfers`);
        console.error(error);
        next(error);
    }
}

export async function getRecentContacts(req: Request, res: Response, next: NextFunction) {
    try {
        let user = await UserModel.findOne({ userId: req.auth.userId });

        if (!user)
            throw new AppError(404, "error", "User not found");
        if (!user.wallet?.id)
            throw new AppError(404, "error", "Wallet not found");

        const wallet = await Wallet.fetch(user.wallet?.id);
        const address = await wallet.getDefaultAddress();
        const _transfers = await address.listTransfers();

        const uniqueDestinations = new Map();

        for await (const transfer of _transfers) {
            const destinationAddress = transfer.getDestinationAddressId();

            if (!uniqueDestinations.has(destinationAddress)) {
                const destinationUser = await UserModel.findOne({ 'wallet.address': { $regex: new RegExp(destinationAddress, 'i') } });

                uniqueDestinations.set(destinationAddress, {
                    destinationAddress: destinationAddress,
                    destinationUser: destinationUser || null,
                });
            }

            if (uniqueDestinations.size >= 5) break;
        }

        const recentContacts = Array.from(uniqueDestinations.values())

        return res.status(200).json({ recentContacts: recentContacts.reverse() });
    } catch (error) {
        console.error(`[controllers/wallet/getRecentContacts] Failed to get recent contacts`);
        console.error(error);
        next(error);
    }
}
