import { ExtendableError } from "ts-error";
export declare class PluginError extends ExtendableError {
    /**
     * Plugin causing the error
     */
    protected plugin?: string;
    /**
     * Wrapped error
     */
    protected error?: Error;
    constructor(message: string, { plugin, error }: {
        plugin?: string;
        error?: Error;
    });
    getPlugin(): string;
    getError(): Error;
}
