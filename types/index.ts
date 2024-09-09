import { StrictAuthProp } from "@clerk/clerk-sdk-node";
import { ClerkEventProp } from "./api.types";

export { NODE_ENV, Status, TransferData } from "./api.types";
export { FaucetConfig } from "./coinbase.types";

declare global {
    namespace Express {
      interface Request extends StrictAuthProp, ClerkEventProp {}
    }
  }