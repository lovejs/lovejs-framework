import * as pretty from "pretty-exceptions/lib";
import { ConfigurationError, Output, ValidationError } from "@lovejs/components";
import { KernelError } from "../kernel";
import { PluginError } from "../plugin";

const output = new Output();

export const ErrorRenderer = (error, depth = 0) => {
    const errorName = error.name;
    output.write(`${depth}. [error]${errorName}[/error]`);
    handleError(error);
    if (error.error || error.wrappedError) {
        ErrorRenderer(error.error || error.wrappedError, ++depth);
    }
};

const handleError = error => {
    switch (true) {
        case error instanceof KernelError:
            output.writeln(`Kernel error at step [info]${error.getStep()}[/info]`);
            break;
        case error instanceof PluginError:
            console.log("plugin error :)");
            break;
        case error instanceof ConfigurationError:
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

        case error instanceof ValidationError:
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
