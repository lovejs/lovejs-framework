"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const stackTrace = require("stack-trace");
exports.errorstack = winston_1.format(info => {
    const message = info.message;
    if (info.error && info.error instanceof Error) {
        info.stack = stackTrace.parse(info.error);
        delete info.error;
    }
    return info;
});
