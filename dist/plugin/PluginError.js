"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_error_1 = require("ts-error");
class PluginError extends ts_error_1.ExtendableError {
    constructor(message, { plugin, error }) {
        super(`Error with plugin "${plugin}" ${message}`);
        this.plugin = plugin;
        this.error = error;
    }
    getPlugin() {
        return this.plugin;
    }
    getError() {
        return this.error;
    }
}
exports.PluginError = PluginError;
