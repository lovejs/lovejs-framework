global.Promise = require("bluebird");

const Plugin = require("./Plugin");
const Kernel = require("./Kernel");
const Cli = require("./Cli");
const Errors = require("./Errors");
 
module.exports = {
    ...Plugin,
    ...Kernel,
    ...Cli,
    ...Errors
};
