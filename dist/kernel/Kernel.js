"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const fileExists = promisify(fs.exists);
const minimist = require("minimist");
/* Dot env related modules */
const dotenvExtended = require("dotenv-extended");
const dotenvExpand = require("dotenv-expand");
const dotenvParseVariables = require("dotenv-parse-variables");
const components_1 = require("@lovejs/components");
const configuration_1 = require("../configuration");
const errors_1 = require("../errors");
const KernelError_1 = require("./KernelError");
const plugin_1 = require("../plugin");
const winston = require("../Logger/Winston");
/**
 * Base Kernel class
 */
class Kernel {
    constructor(projectDir) {
        if (!projectDir) {
            throw new Error(`Kernel must be instanciated with the plugin directory`);
        }
        this.projectDir = projectDir;
        this.plugins = [];
        this.booted = false;
        /**
         * Environment configuration
         */
        this.env = {};
        /**
         * Framework configuration
         */
        this.configuration = {};
        /**
         * Boot process steps
         */
        this.bootSteps = [
            "initialize",
            "initializeLoggers",
            "registerPlugins",
            "bootEmitter",
            "bootContainer",
            "registerListeners",
            "bootPlugins"
        ];
    }
    /**
     * Add a bootstep
     * @param {string} name
     * @param {string} after
     */
    addBootStep(step, after) {
        if (after) {
            if (this.bootSteps.indexOf(after) === -1) {
                throw new Error(`Unable to add bootstep "${step}" after step "${after}" cause the later doesn't exist`);
            }
            this.bootSteps = this.bootSteps.splice(this.bootSteps.indexOf(after), 0, step);
        }
        else {
            this.bootSteps.push(step);
        }
    }
    /**
     * Initialize the environment config,
     * the framework config and register the plugins
     */
    async initialize() {
        this.loadEnv();
        this.loadConfiguration();
    }
    /**
     * Get the framework version
     * @return {string}
     */
    getVersion() {
        return require(__dirname + "/../../package.json").version;
    }
    /**
     * Get the project current path
     * @return {string}
     */
    getProjectDir() {
        return this.projectDir;
    }
    /**
     * Get framework directory
     */
    getFrameworkDir() {
        return __dirname + "/../_framework/";
    }
    /**
     * Get the configuration loader options
     * @param {boolean} withPluginContext
     * @return {object}
     */
    getConfigurationLoadersOptions(withPluginContext = false) {
        const pluginPathResolver = () => this.currentPluginPath || false;
        const ext = new configuration_1.EnvConfigurationExtension(this.getEnv.bind(this), withPluginContext ? pluginPathResolver : false);
        return {
            extensions: [ext]
        };
    }
    /**
     * Register the plugins
     */
    async registerPlugins() {
        const pluginsNames = this.getPluginsNames();
        for (let pluginName of pluginsNames) {
            await this.registerPlugin(pluginName, pluginsNames);
        }
    }
    /**
     * Create the event dispatcher
     */
    async bootEmitter() {
        this.emitter = new components_1.EventDispatcher();
    }
    /**
     * Create the container
     * @return {Container}
     */
    createContainer() {
        const loader = new components_1.ContainerConfigurationLoader(this.getConfigurationLoadersOptions(true));
        const parameters = {
            "kernel.version": this.getVersion()
        };
        let instances = {
            kernel: this,
            emitter: this.emitter,
            logger: this.loggers.default
        };
        for (let name in this.loggers) {
            instances[`logger.${name}`] = this.loggers[name];
        }
        this.container = new components_1.Container({
            debug: this.getConfiguration("container.debug"),
            definitionsLoader: loader,
            instances,
            parameters
        });
    }
    getLoggers() {
        return this.loggers;
    }
    /**
     * Get a winston logger configuration object
     * @param {object} definition
     * @return {object}
     */
    createLogger(definition) {
        let { transports, ...configuration } = definition;
        if (!configuration) {
            configuration = {};
        }
        configuration.transports = [];
        for (let entry of transports) {
            for (let type in entry) {
                const transport = _.find(_.keys(winston.transports), t => t.toLowerCase() == type.toLowerCase());
                if (!transport) {
                    throw new Error(`Unknow winston logger transport specified in framework configuration "${type}"`);
                }
                const module = winston.transports[transport];
                let config = entry[type];
                if (config.formats) {
                    config.format = winston.format.combine.apply(this, _.map(config.formats, (c, f) => winston.format[f](c)));
                    delete config.formats;
                }
                configuration.transports.push(new module(config));
            }
        }
        return configuration;
    }
    /**
     * Create requested loggers
     * @return {loggers[]}
     */
    async initializeLoggers() {
        const config = this.getConfiguration("logger");
        let loggers = {};
        for (let name in config) {
            loggers[name] = winston.createLogger(this.createLogger(config[name]));
            loggers[name].renderError = errors_1.ErrorRenderer;
        }
        if (loggers["kernel"]) {
            this.logger = loggers["kernel"];
        }
        else {
            this.logger = loggers["default"];
        }
        this.loggers = loggers;
    }
    /**
     * Load the environment configuration from process.env & process.args
     */
    loadEnv() {
        let env = dotenvExtended.load({
            silent: false,
            path: path.join(this.getProjectDir(), ".env"),
            defaults: path.join(this.getProjectDir(), ".env.defaults")
        });
        const options = minimist(process.argv);
        for (let option in options) {
            if (option[0] === "-") {
                let value = options[option];
                option = option.slice(1);
                if (option in env) {
                    env[option] = value.toString();
                }
            }
        }
        env = dotenvParseVariables(env);
        env = dotenvExpand(env);
        this.env = { ...env, project_dir: this.getProjectDir() };
    }
    /**
     * Get an environment config
     * @param {string} key
     * @return {mixed}
     */
    getEnv(key = null) {
        if (key) {
            if (!_.has(this.env, key)) {
                throw new Error(`The environment variable ${key} was not found in environment`);
            }
            return _.get(this.env, key);
        }
        else {
            return this.env;
        }
    }
    /**
     * Load the kernel configuration
     */
    loadConfiguration() {
        const loader = new configuration_1.KernelConfigurationLoader(this.getConfigurationLoadersOptions());
        this.configuration = loader.loadFile(`${this.getProjectDir()}/config/config.yml`);
    }
    /**
     * Get a framework configuration
     * @param {string} path
     * @param {mixed} defaultValue
     */
    getConfiguration(path = null, defaultValue = null) {
        return path ? _.get(this.configuration, path, defaultValue) : this.config;
    }
    /**
     * Get the plugins names
     *
     * @return {string[]}
     */
    getPluginsNames() {
        return [];
    }
    /**
     * Get the plugins
     */
    getPlugins() {
        return this.plugins;
    }
    /**
     * Register a plugin
     * @param {string} plugin
     */
    async registerPlugin(plugin, pluginsNames) {
        if (this.booted) {
            throw new plugin_1.PluginError(`Cannot add a plugin on an already booted Kernel`, { plugin });
        }
        let modules = [`@lovejs/${plugin}`, `lovejs-${plugin}`, path.resolve(this.getProjectDir(), `plugins/${plugin}/index.js`)];
        let modulePath;
        for (let module of modules) {
            try {
                modulePath = require.resolve(module);
                break;
            }
            catch (e) { }
        }
        if (!modulePath) {
            throw new plugin_1.PluginError(`Unable to find the plugin '${plugin}', neither as module "@lovejs/${plugin}", "lovejs-${plugin}" or as local plugin in "./plugins/${plugin}" project directory`, { plugin });
        }
        const pluginPath = path.dirname(modulePath);
        const pluginClass = require(modulePath);
        this.currentPluginPath = pluginPath;
        let pluginConfiguration = await this.getPluginConfig(plugin);
        console.log(pluginPath);
        const schemaPath = `${pluginPath}/_framework/configuration/schema.js`;
        if (await fileExists(schemaPath)) {
            const schema = require(schemaPath);
            const validation = new components_1.Validator();
            try {
                await validation.validate(pluginConfiguration, schema);
            }
            catch (error) {
                throw new plugin_1.PluginError(`Configuration error validating configuration from "${this.getPluginConfigFile(plugin)}"`, {
                    plugin,
                    error
                });
            }
        }
        this.plugins.push({
            name: plugin,
            path: pluginPath,
            plugin: new pluginClass(pluginPath, pluginConfiguration, {
                project_dir: this.getProjectDir(),
                plugins: pluginsNames
            })
        });
    }
    /**
     * Get a plugin config file path
     * @param {string} plugin
     */
    getPluginConfigFile(plugin) {
        return `${this.getProjectDir()}/config/plugins/${plugin.toLowerCase()}.yml`;
    }
    /**
     * Get base plugin configuration
     * @param {string} plugin
     */
    async getPluginConfig(plugin) {
        try {
            const filePath = this.getPluginConfigFile(plugin);
            if (await fileExists(filePath)) {
                const loader = new configuration_1.PluginConfigurationLoader(this.getConfigurationLoadersOptions(true));
                return loader.loadFile(filePath);
            }
            else {
                return {};
            }
        }
        catch (error) {
            throw new plugin_1.PluginError(`Error loading configuration`, { plugin, error });
        }
    }
    /**
     * Register emitter listeners/subscribers
     */
    async registerListeners() {
        if (this.isCli) {
            return;
        }
        const services = this.container.getServicesTags(["love.listener", "love.subscriber"]);
        for (let { id, service } of services) {
            for (let tag of service.getTags()) {
                if (tag.getName() === "love.listener") {
                    const listener = await this.container.get(id);
                    const { event, priority, method, name } = tag.getData();
                    if (!event) {
                        throw new Error(`Error registering service ${id} as listener. A listener must have an event to listen to.`);
                    }
                    this.emitter.addListener(event, new components_1.Listener(priority, listener, method, name || id));
                }
                else if (tag.getName() === "love.subscriber") {
                    const subscriber = await this.container.get(id);
                    const { method } = tag.getData();
                    const events = await subscriber[method]();
                    for (let event in events) {
                        this.emitter.addListener(event, new components_1.Listener(0, events[event], null, `${id}.[${event}]`));
                    }
                }
            }
        }
    }
    /**
     * Boot the container, registering services from framework, plugins and app
     * compile the container and preload services
     */
    async bootContainer() {
        this.createContainer();
        await this.registerFrameworkServices();
        await this.registerPluginsServices();
        await this.registerApplicationServices();
        for (let p of this.getPlugins()) {
            const { path, plugin } = p;
            this.currentPluginPath = path;
            if (plugin.beforeContainerCompilation && _.isFunction(plugin.beforeContainerCompilation)) {
                await plugin.beforeContainerCompilation(this.container);
            }
        }
        await this.container.compile();
        console.log(this.container.getService("users.manager"));
        for (let p of this.getPlugins()) {
            const { path, plugin } = p;
            this.currentPluginPath = path;
            if (plugin.afterContainerCompilation && _.isFunction(plugin.afterContainerCompilation)) {
                await plugin.afterContainerCompilation(this.container);
            }
        }
        await this.container.preload();
    }
    /**
     * Register the framework services into the container
     */
    async registerFrameworkServices() {
        if (this.isCli) {
            await this.container.loadDefinitions(path.join(this.getFrameworkDir(), "services/commands.yml"), "framework");
        }
    }
    /**
     * Register the plugins services into the container
     */
    async registerPluginsServices() {
        for (let p of this.getPlugins()) {
            const { name, plugin, path } = p;
            this.currentPluginPath = path;
            if (plugin.registerServices) {
                if (!_.isFunction(plugin.registerServices)) {
                    throw new plugin_1.PluginError(`Error register services, the "registerServices" property on plugin class must be a function`, {
                        plugin: name
                    });
                }
                try {
                    await plugin.registerServices(this.container, name, this.isCli);
                }
                catch (error) {
                    throw new plugin_1.PluginError(`Error registering services`, { plugin: name, error });
                }
            }
        }
    }
    /**
     * Register the application services into the container
     */
    async registerApplicationServices() {
        return await this.container.loadDefinitions(`${this.getProjectDir()}/config/services/services.yml`, "application");
    }
    /**
     * Boot the plugins
     */
    async bootPlugins() {
        for (let p of this.getPlugins()) {
            const { plugin } = p;
            await plugin.boot(this.container, this.logger, this.isCli);
        }
    }
    /**
     * Start the kernel
     */
    async start() {
        try {
            await this.boot();
        }
        catch (error) {
            errors_1.ErrorRenderer(error);
            return;
        }
        this.logger.info(`:purple_heart:  Application boot success in ${this.getEnv("environment")}`);
    }
    /**
     * Start the kernel cli
     * @param {array} args
     */
    async cli(args) {
        this.isCli = true;
        try {
            await this.boot();
            const cli = await this.container.get("cli");
            await cli.execute(args);
            process.exit(0);
        }
        catch (error) {
            errors_1.ErrorRenderer(error);
            process.exit(1);
        }
    }
    /**
     * Boot the kernel
     */
    async boot() {
        let idx = 1;
        let start = +new Date();
        for (let step of this.bootSteps) {
            let startStep = +new Date();
            try {
                await this[step]();
                console.log(` Step n°${idx} ${step} ... ${+new Date() - startStep}ms`);
            }
            catch (error) {
                throw new KernelError_1.KernelError(step, error);
            }
            idx++;
        }
        console.log(`Total booting time: ${+new Date() - start}ms`);
        this.booted = true;
    }
    /**
     * Halt the kernel
     */
    async halt() {
        await this.haltPlugins();
    }
    /**
     * Halt the plugins
     */
    async haltPlugins() {
        for (let p of this.plugins) {
            const { plugin } = p;
            await plugin.halt(this.container, this.logger, this.isCli);
        }
    }
}
exports.Kernel = Kernel;
