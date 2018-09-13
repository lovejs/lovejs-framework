import { format } from "winston";
import * as stackTrace from "stack-trace";

export const errorstack = format(info => {
    const message = info.message;

    if (info.error && info.error instanceof Error) {
        info.stack = stackTrace.parse(info.error);
        delete info.error;
    }

    return info;
});
