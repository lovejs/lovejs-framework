import { ExtendableError } from "ts-error";

export class KernelError extends ExtendableError {
    /**
     * Kernel boot step error occureds
     */
    protected step?: string;

    /**
     * Wrapped error
     */
    protected error?: Error;

    constructor(step: string, error: Error) {
        super(`Kernel error at boot step '${step}' ${error.message}`);
        this.step = step;
        this.error = error;
    }

    getStep() {
        return this.step;
    }

    getError() {
        return this.error;
    }
}
