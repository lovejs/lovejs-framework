import { Container } from "@lovejs/components";
export declare class Plugin {
    /**
     * Project directory
     */
    protected projectDir: string;
    /**
     * Plugin directory
     */
    protected pluginDir: string;
    /**
     * Plugin configuration
     */
    protected configuration: any;
    /**
     * List of project plugins name
     */
    protected plugins: string[];
    constructor(pluginDir: any, configuration: any, { projectDir, plugins }: {
        projectDir: any;
        plugins: any;
    });
    /**
     * Check if current project has given plugin activated
     * @param plugin
     */
    hasPlugin(plugin: string): boolean;
    /**
     * Get the raw plugin configuration (ie. Before normalization)
     */
    getRawConfiguration(): any;
    /**
     * Get the plugin directory or resolve a file path relatively to the plugin directory
     * @param filename The filename to resolve the path
     */
    getPluginDir(filename?: string): string;
    /**
     * Get the project directory or resolve a file path relatively to the project directory
     * @param filename The filename to resolve the path
     */
    getProjectDir(filename?: string): string;
    /**
     * Get the configuration or a configuration path
     * @param key
     * @param defaultValue
     */
    get(key?: string, defaultValue?: any): any;
    /**
     * If defined this method is called when the kernel boot
     * use this method when the plugin need to initialize stuff at startup
     * @param container The container
     * @param isCli true if in cli mode
     */
    boot(container: Container, isCli: boolean): Promise<void>;
    /**
     * If defined, this method is called when the kernel halt
     * use this method when the plugin need to do stuff before the kernel halt (closing connection, etc...)
     * @param container The container
     * @param isCli true if in cli mode
     */
    halt(container: Container, isCli: boolean): Promise<void>;
}
