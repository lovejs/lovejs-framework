export declare class Cli {
    protected program: Caporal;
    constructor(version: any, commands?: any[]);
    registerCommand(command: any): void;
    love(): string;
    execute(args: any): Promise<void>;
}
