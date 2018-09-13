"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("@lovejs/components");
const _ = require("lodash");
class PluginsCommand extends components_1.Command {
    constructor(kernel) {
        super();
        this.kernel = kernel;
        this.prefix = "plugins";
    }
    getOutputStyles() {
        return {
            plugin: { fg: "#DB49AC", style: "bold" },
            config: "cyanBright",
            header: { fg: "whiteBright", style: ["bold"] }
        };
    }
    register(program) {
        program
            .command(`${this.prefix}:list`, `List installed plugin`)
            .option("-d, --database [db]", "Use following database (default: 'default')")
            .option("-a, --alter", "Try to synchronize database with alter statements instead of DROP / CREATE", false)
            .option("-f, --force", "Force database synchronisation (DROP TABLE)", false)
            .option("-m, --model", "Synchronise only specified model", false)
            .action(this.list.bind(this));
        program
            .command(`${this.prefix}:info`, `Get information about a specific plugin`)
            .argument("<plugin>", "Plugin to get info from")
            .action(this.info.bind(this));
    }
    async list() {
        const plugins = this.kernel.getPlugins();
        const rows = [];
        rows.push(["[header]Plugin[/header]"]);
        _.each(plugins, ({ name }) => {
            rows.push([`[plugin]${name}[/plugin]`]);
        });
        this.output.table(rows);
    }
    async info() { }
}
exports.PluginsCommand = PluginsCommand;
