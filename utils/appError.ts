import { Status } from "../types";

/**
 * @params {`statusCode`, `status`, `message`}
 */
class AppError extends Error {
    statusCode: number;
    status: string;
    constructor(statusCode: number, status: Status, message: string) {
        super(message);
        this.statusCode = statusCode || 500;
        this.status = status || "error";
        this.message = message || "Something went wrong";
    }
}

export default AppError;
