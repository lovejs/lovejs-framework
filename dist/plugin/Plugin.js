"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
class Plugin {
    constructor(pluginDir, configuration, { projectDir, plugins }) {
        this.pluginDir = pluginDir;
        this.configuration = configuration;
        this.plugins = plugins.map(p => p.toLowerCase());
        this.projectDir = projectDir;
    }
    /**
     * Check if current project has given plugin activated
     * @param plugin
     */
    hasPlugin(plugin) {
        return this.plugins.includes(plugin.toLowerCase());
    }
    /**
     * Get the raw plugin configuration (ie. Before normalization)
     */
    getRawConfiguration() {
        return this.configuration;
    }
    /**
     * Get the plugin directory or resolve a file path relatively to the plugin directory
     * @param filename The filename to resolve the path
     */
    getPluginDir(filename) {
        return filename ? path.join(this.pluginDir, filename) : this.pluginDir;
    }
    /**
     * Get the project directory or resolve a file path relatively to the project directory
     * @param filename The filename to resolve the path
     */
    getProjectDir(filename) {
        return filename ? path.join(this.projectDir, filename) : this.pluginDir;
    }
    /**
     * Get the configuration or a configuration path
     * @param key
     * @param defaultValue
     */
    get(key, defaultValue) {
        if (!key) {
            return this.configuration;
        }
        else {
            return _.get(this.configuration, key, defaultValue);
        }
    }
    /**
     * If defined this method is called when the kernel boot
     * use this method when the plugin need to initialize stuff at startup
     * @param container The container
     * @param isCli true if in cli mode
     */
    async boot(container, isCli) { }
    /**
     * If defined, this method is called when the kernel halt
     * use this method when the plugin need to do stuff before the kernel halt (closing connection, etc...)
     * @param container The container
     * @param isCli true if in cli mode
     */
    async halt(container, isCli) { }
}
exports.Plugin = Plugin;
