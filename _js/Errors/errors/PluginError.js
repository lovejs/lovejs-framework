const _ = require("lodash");
const ExtendableError = require("es6-error");

class PluginError extends ExtendableError {
    constructor(plugin, message) {
        super(`Plugin "${plugin}" error : ${message}`);
    }
}

module.exports = PluginError; 
