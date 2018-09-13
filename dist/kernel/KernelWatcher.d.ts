import { Kernel } from "./Kernel";
/**
 * The Kernel watcher watch for changes in the project dir and optionnals modules and/or folders.
 * If a change is detected, the module cache is clear and the kernel reboot
 */
export declare class KernelWatcher {
    /**
     * Kernel builder function
     */
    protected builder: (...a: any[]) => Kernel;
    /**
     * List of modules to watch for changes
     */
    protected modules: string[];
    /**
     * List of folders to watch for changes
     */
    protected folders: string[];
    /**
     * The current kernel instance
     */
    protected kernel: Kernel;
    /**
     * The project directory
     */
    protected projectDir: string;
    /**
     * Is the kernel currently booting
     */
    protected booting: boolean;
    /**
     * List of glob pattern to use for app watching, module watching and folder watching
     */
    protected glob: {
        app: string;
        module: string;
        folder: string;
    };
    /**
     * Debonced method to reboot the kernel
     */
    protected reboot: () => Promise<void>;
    constructor(builder: any, options: any);
    /**
     * Display an info message
     * @param msg Message to display
     */
    info(msg: string): void;
    /**
     * Display an error message
     * @param msg Error message
     * @param error The raised error
     */
    error(msg: string, error: Error): void;
    /**
     * Boot the kernel and start the watch process
     */
    start(): Promise<void>;
    /**
     * Boot the kernel
     */
    boot(): Promise<void>;
    /**
     * Reboot the kernel
     */
    doReboot(): Promise<void>;
    /**
     * Clear only module in watched directory
     */
    clearCacheModules(): void;
    /**
     * Given a module, try to resolve is real directory to watch
     */
    getModuleDirectory(module: any): Promise<any>;
    /**
     * Watch the kernel project dir, specified modules and folders
     */
    watch(): Promise<void>;
}
