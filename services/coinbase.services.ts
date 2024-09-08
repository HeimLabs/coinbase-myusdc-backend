import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { UserDocument } from "../models/User.model";

const cb: Coinbase = Coinbase.configureFromJson({ filePath: 'cdp_api_key.json', useServerSigner: true });

const createWalletForUser = async (user: UserDocument) => {
    const wallet = await Wallet.create({
        networkId: process.env.APP_ENV === "production"
            ? Coinbase.networks.BaseMainnet
            : Coinbase.networks.BaseSepolia,
    });

    if (user.wallet) {
        user.wallet.id = wallet.getId();
        user.wallet.address = (await wallet.getDefaultAddress()).getId();
        await user.save();
    }

    return wallet;
}

const fundWallet = async (wallet: Wallet, asset: string) => {
    if (wallet.getNetworkId() === Coinbase.networks.BaseSepolia) {
        await wallet.faucet(asset)
    }
}

export { cb, createWalletForUser, fundWallet }