import fs from "fs";
import { FaucetConfig } from "types";

export const getWalletIdFromPath = (filePath: string): string => {
    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const originalConfig: FaucetConfig = JSON.parse(rawData);

        return originalConfig.walletId;
    } catch (error) {
        console.error('Error reading or parsing file:', error);
        throw error;
    }
}

export const storeWalletIdToPath = (filePath: string, walletId: string): void => {
    try {
        let config: FaucetConfig;

        try {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            config = JSON.parse(rawData);
        } catch (error) {
            config = { walletId: '' };
        }

        config.walletId = walletId;

        fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');

        console.log(`[utils/coinbase] ✅ Wallet ID successfully stored to ${filePath}`);
    } catch (error) {
        console.error('[utils/coinbase] ❌ Error storing wallet ID:', error);
        throw error;
    }
}