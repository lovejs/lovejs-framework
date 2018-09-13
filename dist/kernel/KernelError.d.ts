import { ExtendableError } from "ts-error";
export declare class KernelError extends ExtendableError {
    /**
     * Kernel boot step error occureds
     */
    protected step?: string;
    /**
     * Wrapped error
     */
    protected error?: Error;
    constructor(step: string, error: Error);
    getStep(): string;
    getError(): Error;
}
