const { Command } = require("@lovejs/components/console");
const _ = require("lodash");

const path = require("path");

class DebugContainerCommand extends Command {
    constructor(container, project_dir) {
        super();
        this.container = container;
        this.project_dir = project_dir;
    }

    getOutputStyles() {
        return {
            serviceId: { fg: "#DB49AC", style: "bold" },
            method: { style: "italic" },
            path: "cyanBright",
            header: { fg: "whiteBright", style: ["bold"] },
            label: { bg: [249, 217, 119], fg: "#000", style: ["bold"], transform: v => ` ${v} ` }
        };
    }

    register(program) {
        program
            .command("debug:container")
            .description("Return list of services from the container")
            .action(this.execute.bind(this));
    }

    execute() {
        let services = this.container.getServices();
        services = _(services)
            .toPairs()
            .sortBy(0)
            .fromPairs()
            .value();

        const rows = [];
        rows.push(["[header]Service[/header]", "[header]Type[/header]", "[header]Description[/header]"]);
        _.each(services, (service, id) => {
            let module = service.getModule();
            let factory = service.getFactory();
            let alias = service.getAlias();
            let from, type, creation;

            if (module) {
                if (_.isString(module)) {
                    type = "Module";
                    from = `[path]${path.relative(this.project_dir, module)}[/path]`;
                } else {
                    type = "Instance";
                    from = "N/A";
                }
            } else if (factory) {
                type = "Factory";
                from = `[serviceId]${factory.getService()}.[method]${factory.getMethod()}()[/method][/serviceId]`;
            } else if (alias) {
                type = "Alias";
                from = `[serviceId] ==> s${alias}[/serviceId]`;
            } else {
                type = "Unknow";
                from = "Unknow";
            }

            rows.push([`[serviceId]${id}[/serviceId]`, `[label]${type}[/label]`, from]); //, [], [], service.origin]);
        });

        this.output(this.table(rows));
    }
}

module.exports = DebugContainerCommand;
