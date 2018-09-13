import { Container } from "@lovejs/components";
import { EnvConfigurationExtension } from "../configuration";
/**
 * Base Kernel class
 */
export declare class Kernel {
    /**
     * Project directory
     */
    protected projectDir: string;
    /**
     *
     */
    protected plugins: any[];
    protected currentPluginPath?: string;
    protected booted: boolean;
    protected env: any;
    protected configuration: any;
    protected bootSteps: string[];
    protected emitter: any;
    protected loggers: {
        [name: string]: any;
    };
    protected logger: any;
    protected container: Container;
    protected isCli: boolean;
    protected config: any;
    constructor(projectDir: any);
    /**
     * Add a bootstep
     * @param {string} name
     * @param {string} after
     */
    addBootStep(step: string, after?: string): void;
    /**
     * Initialize the environment config,
     * the framework config and register the plugins
     */
    initialize(): Promise<void>;
    /**
     * Get the framework version
     * @return {string}
     */
    getVersion(): any;
    /**
     * Get the project current path
     * @return {string}
     */
    getProjectDir(): string;
    /**
     * Get framework directory
     */
    getFrameworkDir(): string;
    /**
     * Get the configuration loader options
     * @param {boolean} withPluginContext
     * @return {object}
     */
    getConfigurationLoadersOptions(withPluginContext?: boolean): {
        extensions: EnvConfigurationExtension[];
    };
    /**
     * Register the plugins
     */
    registerPlugins(): Promise<void>;
    /**
     * Create the event dispatcher
     */
    bootEmitter(): Promise<void>;
    /**
     * Create the container
     * @return {Container}
     */
    createContainer(): void;
    getLoggers(): {
        [name: string]: any;
    };
    /**
     * Get a winston logger configuration object
     * @param {object} definition
     * @return {object}
     */
    createLogger(definition: any): any;
    /**
     * Create requested loggers
     * @return {loggers[]}
     */
    initializeLoggers(): Promise<void>;
    /**
     * Load the environment configuration from process.env & process.args
     */
    loadEnv(): void;
    /**
     * Get an environment config
     * @param {string} key
     * @return {mixed}
     */
    getEnv(key?: any): any;
    /**
     * Load the kernel configuration
     */
    loadConfiguration(): void;
    /**
     * Get a framework configuration
     * @param {string} path
     * @param {mixed} defaultValue
     */
    getConfiguration(path?: any, defaultValue?: any): any;
    /**
     * Get the plugins names
     *
     * @return {string[]}
     */
    getPluginsNames(): any[];
    /**
     * Get the plugins
     */
    getPlugins(): any[];
    /**
     * Register a plugin
     * @param {string} plugin
     */
    registerPlugin(plugin: any, pluginsNames: any): Promise<void>;
    /**
     * Get a plugin config file path
     * @param {string} plugin
     */
    getPluginConfigFile(plugin: any): string;
    /**
     * Get base plugin configuration
     * @param {string} plugin
     */
    getPluginConfig(plugin: any): Promise<any>;
    /**
     * Register emitter listeners/subscribers
     */
    registerListeners(): Promise<void>;
    /**
     * Boot the container, registering services from framework, plugins and app
     * compile the container and preload services
     */
    bootContainer(): Promise<void>;
    /**
     * Register the framework services into the container
     */
    registerFrameworkServices(): Promise<void>;
    /**
     * Register the plugins services into the container
     */
    registerPluginsServices(): Promise<void>;
    /**
     * Register the application services into the container
     */
    registerApplicationServices(): Promise<Container>;
    /**
     * Boot the plugins
     */
    bootPlugins(): Promise<void>;
    /**
     * Start the kernel
     */
    start(): Promise<void>;
    /**
     * Start the kernel cli
     * @param {array} args
     */
    cli(args: any): Promise<void>;
    /**
     * Boot the kernel
     */
    boot(): Promise<void>;
    /**
     * Halt the kernel
     */
    halt(): Promise<void>;
    /**
     * Halt the plugins
     */
    haltPlugins(): Promise<void>;
}
