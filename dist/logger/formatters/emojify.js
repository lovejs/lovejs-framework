"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const emoji = require("node-emoji");
exports.emojify = winston_1.format((info, opts) => {
    if (typeof info.message == "string") {
        if (opts) {
            info.message = emoji.emojify(info.message);
        }
        else {
            info.message = emoji.strip(info.message);
        }
    }
    return info;
});
