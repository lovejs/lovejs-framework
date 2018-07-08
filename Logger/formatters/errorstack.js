const { format } = require("winston");
const stackTrace = require("stack-trace");

const errorstack = format((info, opts) => {
    if (info.message instanceof Error) {
        info.stack = stackTrace.parse(info.message);
        info.message = info.message.message;
    }

    if (info.error && info.error instanceof Error) {
        info.stack = stackTrace.parse(info.error);
        info.error = false;
    }

    return info;
});

module.exports = errorstack;
