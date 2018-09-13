import { ExtendableError } from "ts-error";

export class PluginError extends ExtendableError {
    /**
     * Plugin causing the error
     */
    protected plugin?: string;

    /**
     * Wrapped error
     */
    protected error?: Error;

    constructor(message: string, { plugin, error }: { plugin?: string; error?: Error }) {
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
