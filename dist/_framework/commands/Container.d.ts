import { Command, Container } from "@lovejs/components";
/**
 * Display the list of services & parameters in the container
 */
export declare class DebugContainerCommand extends Command {
    /**
     * Services container
     */
    protected container: Container;
    /**
     * Project directory
     */
    protected projectDir: string;
    constructor(container: any, projectDir: any);
    getOutputStyles(): {
        serviceId: {
            fg: string;
            style: string;
        };
        method: {
            style: string;
        };
        path: string;
        header: {
            fg: string;
            style: string[];
        };
        label: {
            bg: number[];
            fg: string;
            style: string[];
            transform: (v: any) => string;
        };
    };
    register(program: any): void;
    executeServicesList(): Promise<void>;
    executeServiceExecute({ service, method }: {
        service: any;
        method: any;
    }): Promise<void>;
}
