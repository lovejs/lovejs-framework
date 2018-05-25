const pretty = require("pretty-exceptions/lib");
const options = {
    source: true,
    native: true,
    color: true,
    cwd: process.cwd()
};

const DiSchemaError = require("@lovejs/components/di/errors/DiSchemaError.js");

module.exports = error => {
    switch (true) {
        case error instanceof DiSchemaError:
            console.error(displayDiSchemaError(error));
            break;
        default:
            console.error(pretty(error, options));
            if (error.wrappedError) {
                console.error(pretty(error.wrappedError, options));
            }
    }
};


const displayDiSchemaError = error => {
    var table = new Table();

    table.push([{ content: "In file " + exception.file.red, colSpan: 2 }]);
    table.push(["Path".green, "Error".red]);
    exception.schemaError.map(e => {
        table.push([e.dataPath, e.message]);
    });

    table.push({ "Some key": "Some value" }, { "Another key": "Another value" });

    return table.toString();
};
