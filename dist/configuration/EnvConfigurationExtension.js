"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
class EnvConfigurationExtension {
    constructor(getEnv, pluginDirResolver) {
        this.getEnv = getEnv;
        this.pluginDirResolver = pluginDirResolver;
    }
    async getTags() {
        return {
            environment: {
                schema: { type: "object" },
                normalize: async (data) => this.getEnvironmentConfig(data)
            },
            is_environment: {
                schema: { type: "string" },
                normalize: async (data) => this.getEnv("environment").toLowerCase() === data.toLowerCase()
            },
            env: {
                schema: { type: "string" },
                normalize: async (data) => this.getEnv(data)
            },
            project_dir: {
                schema: { type: "string" },
                normalize: async (data) => path.join(this.getEnv("project_dir"), data)
            },
            plugin_dir: {
                schema: { type: "string" },
                normalize: async (data) => path.join(this.pluginDirResolver(), data)
            },
            framework_dir: {
                schema: { type: "string" },
                normalize: async (data) => path.join(__dirname, "..", data)
            }
        };
    }
    async getNormalizers() {
        return [];
    }
    getTemplateVars() {
        return { env: this.getEnv() };
    }
    getEnvironmentConfig(configuration) {
        const environment = this.getEnv("environment");
        const config = _.get(configuration, "default", {});
        const envConfig = _.get(configuration, environment, {});
        _.merge(config, envConfig);
        return config;
    }
}
exports.EnvConfigurationExtension = EnvConfigurationExtension;
