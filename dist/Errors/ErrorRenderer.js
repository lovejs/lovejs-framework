"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pretty = require("pretty-exceptions/lib");
const components_1 = require("@lovejs/components");
const kernel_1 = require("../kernel");
const plugin_1 = require("../plugin");
const output = new components_1.Output();
exports.ErrorRenderer = (error, depth = 0) => {
    const errorName = error.name;
    output.write(`${depth}. [error]${errorName}[/error]`);
    handleError(error);
    if (error.error || error.wrappedError) {
        exports.ErrorRenderer(error.error || error.wrappedError, ++depth);
    }
};
const handleError = error => {
    switch (true) {
        case error instanceof kernel_1.KernelError:
            output.writeln(`Kernel error at step [info]${error.getStep()}[/info]`);
            break;
        case error instanceof plugin_1.PluginError:
            console.log("plugin error :)");
            break;
        case error instanceof components_1.ConfigurationError:
            const rows = [];
            /*
            rows.push(["Path", "Error"]);
            error.shemaError &&
                error.schemaError.map(e => {
                    rows.push([e.dataPath, e.message]);
                });
                */
            rows.push({ "Some key": "Some value" }, { "Another key": "Another value" });
            //output.table(rows);
            break;
        case error instanceof components_1.ValidationError:
            console.log("validation errors :)");
            for (let i = 0; i < error.errors.length; i++) {
                output.writeln(error.errors[i]);
            }
            break;
        default:
            const options = {
                source: true,
                native: true,
                color: true,
                cwd: process.cwd()
            };
            console.error(pretty(error, options));
    }
};
