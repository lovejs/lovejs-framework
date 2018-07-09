const { format } = require("winston");
const emoji = require("node-emoji");

const emojify = format((info, opts) => {
    if (typeof info.message == "string") {
        if (opts) {
            info.message = emoji.emojify(info.message);
        } else {
            info.message = emoji.strip(info.message);
        }
    }

    return info;
});

module.exports = emojify;
