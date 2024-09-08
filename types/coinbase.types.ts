export interface SeedConfig {
    [key: string]: {
        seed: string;
        encrypted: boolean;
        authTag: string;
        iv: string;
    };
}

export interface TransformedConfig {
    walletId: string;
    seed: string;
}