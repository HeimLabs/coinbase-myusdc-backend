import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { UserDocument } from "../models/User.model";
import { getWalletIdFromPath, storeWalletIdToPath } from "../utils/coinbase.utils";
import fs from "fs";

const cb = Coinbase.configureFromJson({ filePath: 'cdp_api_key.json', useServerSigner: true });

const createWalletForUser = async (user: UserDocument) => {
    const wallet = await Wallet.create({
        networkId: process.env.APP_ENV === "production"
            ? Coinbase.networks.BaseMainnet
            : Coinbase.networks.BaseSepolia,
    });

    if (user.wallet) {
        user.wallet.id = wallet.getId();
        user.wallet.address = (await wallet.getDefaultAddress()).getId();
    }
    return (await user.save());
}

// FAUCET

let _faucet: Wallet;
const faucet = () => _faucet;
const faucetIdPath = "faucet_id.json";

const setupFaucet = async () => {
    try {
        // If Wallet exists
        if (fs.existsSync(faucetIdPath)) {
            console.log("[coinbase/setup] 🔄 Faucet exists, re-instantiating...");
            const faucetId = getWalletIdFromPath(faucetIdPath);
            _faucet = await Wallet.fetch(faucetId);
            console.log("[coinbase/setup] ✅ Faucet re-instantiated: ", (await _faucet.getDefaultAddress()).getId());
        }
        // Create Wallet
        else {
            console.log("[coinbase/setup] 🔄 Creating faucet wallet...");
            _faucet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
            storeWalletIdToPath(faucetIdPath, _faucet.getId() as string);
            console.log("[coinbase/setupFaucet] ✅ Faucet set up: ", (await _faucet.getDefaultAddress()).getId());
        }
    } catch (err) {
        console.error("[coinbase/setupFaucet] ❌ Failed to setup Faucet");
        console.error(err);
        throw err;
    }
}

const fundWallet = async (destination: string, asset: string, amount: number) => {
    await (await faucet().createTransfer({
        destination: destination,
        amount: amount,
        assetId: asset,
        gasless: asset === Coinbase.assets.Usdc ? true : false,
    })).wait({timeoutSeconds: 30});
}

export { cb, createWalletForUser, fundWallet, faucet, setupFaucet }