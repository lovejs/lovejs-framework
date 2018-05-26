const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const fileExists = promisify(fs.exists);

const semver = require("semver");
const winston = require("winston");

const {
    ErrorRenderer,
    errors: { PluginError }
} = require("../Errors");

const { EnvConfigExtension, KernelConfigLoader, PluginConfigLoader } = require("../Config");
const {
    emitter: { Emitter, Listener },
    di: { Container, DefinitionsConfigLoader },
    console: { Output },
    validation: { Validation }
} = require("@lovejs/components");
winston.format.emojify = require("../Logger/formatters/emojify");
winston.format.stylify = require("../Logger/formatters/stylify");
winston.transports["Notifier"] = require("../Logger/transports/NotifyTransport");

/**
 * Base Kernel class
 */
class Kernel {
    constructor(projectDir, pluginsNames = []) {
        if (!projectDir) {
            throw new Error(`Kernel must be instanciated with the plugin directory`);
        }

        this.projectDir = projectDir;
        this.pluginsNames = pluginsNames;
        this.plugins = [];
        this.currentPluginPath = false;
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
    addBootStep(step, after = false) {
        if (after) {
            if (this.bootSteps.indexOf(after) === -1) {
                throw new Error(`Unable to add bootstep ${step} after step ${after} cause this step doesn't exist`);
            }
            this.bootSteps = this.bootSteps.slice(this.bootSteps.indexOf(after), 0, step);
        } else {
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
        return require(__dirname + "/../package.json").version;
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
    getLoaderOptions(withPluginContext = false) {
        const pluginPathResolver = () => this.currentPluginPath || false;
        const ext = new EnvConfigExtension(this.getEnv(), withPluginContext ? pluginPathResolver : false);
        return {
            extensions: [ext]
        };
    }

    /**
     * Register the plugins
     */
    async registerPlugins() {
        for (let pluginName of this.pluginsNames) {
            await this.registerPlugin(pluginName);
        }
    }

    /**
     * Create the event emitter
     */
    async bootEmitter() {
        this.emitter = new Emitter();
    }

    /**
     * Create the container
     * @return {Container}
     */
    createContainer() {
        const loader = new DefinitionsConfigLoader(this.getLoaderOptions(true));

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

        this.container = new Container({
            debug: this.getConfiguration("container.debug"),
            loader,
            instances,
            parameters
        });
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
                    console.log(`Unknow winston logger transport "${type}"`);
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
            loggers[name].renderError = ErrorRenderer;
        }

        if (loggers["kernel"]) {
            this.logger = loggers["kernel"];
        } else {
            this.logger = loggers["default"];
        }

        this.loggers = loggers;
    }

    /**
     * Load the environment configuration from process.env
     */
    loadEnv() {
        this.env = { ...process.env, project_dir: this.getProjectDir() };
    }

    /**
     * Get an environment config
     * @param {string} key
     * @return {mixed}
     */
    getEnv(key = null) {
        return key ? _.get(this.env, key) : this.env;
    }

    /**
     * Load the kernel configuration
     */
    loadConfiguration() {
        const loader = new KernelConfigLoader(this.getLoaderOptions());
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
     * @return {string[]}
     */
    getPluginsNames() {
        return this.pluginsNames;
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
    async registerPlugin(plugin) {
        if (this.booted) {
            throw new PluginError(plugin, `Cannot add a plugin on an already booted Kernel`);
        }

        let modules = [`@lovejs/${plugin}`, `lovejs-${plugin}`, path.resolve(this.getProjectDir(), `plugins/${plugin}/index.js`)];
        let modulePath;

        for (let module of modules) {
            try {
                modulePath = require.resolve(module);
                break;
            } catch (e) {}
        }

        if (!modulePath) {
            throw new PluginError(
                plugin,
                `Unable to find the plugin, neither as module "@lovejs-${plugin}", "lovejs-${plugin}" or as local plugin in "./plugins/${plugin}" project directory`
            );
        }

        const pluginPath = path.dirname(modulePath);
        const pluginClass = require(modulePath);
        this.currentPluginPath = pluginPath;
        let pluginConfiguration = await this.getPluginConfig(plugin);
        const schemaPath = `${pluginPath}/_framework/configuration/schema.js`;

        if (await fileExists(schemaPath)) {
            const schema = require(schemaPath);
            const validation = new Validation(schema);
            try {
                validation.validate(pluginConfiguration);
            } catch (e) {
                throw new PluginError(
                    plugin,
                    `Configuration error in plugin configuration "${this.getPluginConfigFile(plugin)}" validating\n${e.message}`
                );
            }
        }

        this.plugins.push({
            name: plugin,
            path: pluginPath,
            plugin: new pluginClass(pluginPath, pluginConfiguration, {
                project_dir: this.getProjectDir(),
                plugins: this.getPluginsNames()
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
                const loader = new PluginConfigLoader(this.getLoaderOptions(true));
                return loader.loadFile(filePath);
            } else {
                return {};
            }
        } catch (e) {
            throw new PluginError(plugin, `An error occured trying to load configuration for plugin "${plugin}" : ${e.message}`);
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
                    this.emitter.addListener(event, new Listener(priority, listener, method, name || id));
                } else if (tag.getName() === "love.subscriber") {
                    const subscriber = await this.container.get(id);
                    const { method } = tag.getData();
                    const events = await subscriber[method]();
                    for (let event in events) {
                        this.emitter.addListener(event, new Listener(0, events[event], null, `${id}.[${event}]`));
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

        for (let p of this.plugins) {
            const { path, plugin } = p;
            this.currentPluginPath = path;
            if (plugin.beforeContainerCompilation && _.isFunction(plugin.beforeContainerCompilation)) {
                await plugin.beforeContainerCompilation(this.container);
            }
        }

        await this.container.compile();

        for (let p of this.plugins) {
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
        for (let p of this.plugins) {
            const { name, plugin, path } = p;
            this.currentPluginPath = path;
            if (plugin.registerServices) {
                if (!_.isFunction(plugin.registerServices)) {
                    throw new PluginError(
                        name,
                        `Error register services for plugin "${name}", the "registerServices" property must be a function`
                    );
                }
                try {
                    await plugin.registerServices(this.container, name, this.isCli);
                } catch (e) {
                    throw new PluginError(name, `Error registering services for plugin "${name}": ${e.message}`);
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
        for (let p of this.plugins) {
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
        } catch (error) {
            ErrorRenderer(error);
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
        let cli;
        try {
            await this.boot();
            const cli = await this.container.get("cli");
            await cli.execute(args);
            process.exit(0);
        } catch (error) {
            ErrorRenderer(error);
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
            } catch (e) {
                console.error(` Step n°${idx} failed with error: ${e.message}`);
                throw e;
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

module.exports = Kernel;
