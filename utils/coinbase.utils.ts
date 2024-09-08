import fs from "fs";
import { SeedConfig, TransformedConfig } from "types";

export const transformConfig = (filePath: string): TransformedConfig => {
    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const originalConfig: SeedConfig = JSON.parse(rawData);

        const walletId = Object.keys(originalConfig)[0];
        const { seed } = originalConfig[walletId];

        return {
            walletId,
            seed
        };
    } catch (error) {
        console.error('Error reading or parsing file:', error);
        throw error;
    }
}