import { format } from "winston";
import * as emoji from "node-emoji";

export const emojify = format((info, opts) => {
    if (typeof info.message == "string") {
        if (opts) {
            info.message = emoji.emojify(info.message);
        } else {
            info.message = emoji.strip(info.message);
        }
    }

    return info;
});
