import { Command } from "@lovejs/components";
import { Kernel } from "../../kernel";
export declare class PluginsCommand extends Command {
    /**
     * The application kernel
     */
    protected kernel: Kernel;
    /**
     * Command prefix
     */
    protected prefix: string;
    constructor(kernel: any);
    getOutputStyles(): {
        plugin: {
            fg: string;
            style: string;
        };
        config: string;
        header: {
            fg: string;
            style: string[];
        };
    };
    register(program: any): void;
    list(): Promise<void>;
    info(): Promise<void>;
}
