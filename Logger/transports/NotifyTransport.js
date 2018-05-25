const Transport = require("winston-transport");
const notifier = require("node-notifier");
const path = require("path");

class NotifyTransport extends Transport {
    log(info, callback) {
        const self = this;
        setImmediate(function() {
            self.emit("logged", info);
        });

        notifier.notify({
            title: info.level,
            message: info.message,
            icon: path.join(__dirname, `icons/${info.level}.png`),
            sound: "Submarine",
            wait: true
        });

        callback();
    }
}

module.exports = NotifyTransport;
