"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_error_1 = require("ts-error");
class KernelError extends ts_error_1.ExtendableError {
    constructor(step, error) {
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
exports.KernelError = KernelError;
