import * as Transport from "winston-transport";
import * as notifier from "node-notifier";
import * as path from "path";

export class NotifyTransport extends Transport {
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
