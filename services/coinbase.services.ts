import { Coinbase } from "@coinbase/coinbase-sdk";

let coinbase: Coinbase = Coinbase.configureFromJson({ filePath: 'cdp_api_key.json', useServerSigner: true });

export { coinbase };