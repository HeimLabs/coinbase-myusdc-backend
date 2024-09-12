import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    imageUrl: {
        type: String,
        required: true,
    },
    wallet: {
        id: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: false
        },
        usdBalance: {
            type: Number,
            default: 1200
        },
        rewards: {
            type: {
                amount: {
                    type: Number,
                    default: 0
                },
                lastUpdated: {
                    type: Date,
                    default: Date.now()
                }
            },
            required: true
        }
    },
    faucet: {
        type: {
            amount: {
                type: Number,
                default: 0,
                required: true
            },
            lastRequested: {
                type: Date,
                required: false
            },
        },
        required: true
    }
});

export const UserModel = mongoose.model("User", UserSchema);
export type UserDocument = mongoose.InferSchemaType<typeof UserSchema> & mongoose.Document;
