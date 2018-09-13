import { Command, Container } from "@lovejs/components";
import * as _ from "lodash";
import * as path from "path";

/**
 * Display the list of services & parameters in the container
 */
export class DebugContainerCommand extends Command {
    /**
     * Services container
     */
    protected container: Container;

    /**
     * Project directory
     */
    protected projectDir: string;

    constructor(container, projectDir) {
        super();
        this.container = container;
        this.projectDir = projectDir;
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
            .command("container:services:list")
            .description("Return list of services from the container")
            .action(this.executeServicesList.bind(this));

        program
            .command("container:service:execute")
            .description("Execute a service form the container")
            .argument("<service>", "Service to call")
            .argument("[method]", "Service method to call")
            .action(this.executeServiceExecute.bind(this));
    }

    async executeServicesList() {
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
                    from = `[path]${path.relative(this.projectDir, module)}[/path]`;
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

            rows.push([`[serviceId]${id}[/serviceId]`, `[label]${type}[/label]`, from]);
        });

        this.output.table(rows);
    }

    async executeServiceExecute({ service, method }) {
        const instance = await this.container.get(service);
        const res = method ? await instance[method].apply(instance) : instance();
        this.output.writeln(res);
    }
}
