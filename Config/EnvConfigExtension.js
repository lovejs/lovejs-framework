const _ = require("lodash");
const path = require("path");
const {
    config: { ConfigExtension }
} = require("@lovejs/components");

class EnvConfigExtension extends ConfigExtension {
    constructor(env, pluginDirResolver) {
        super();
        this.env = env;
        this.pluginDirResolver = pluginDirResolver;
    }

    getTags() {
        return {
            environment: {
                schema: { type: "object" },
                normalize: data => this.getEnvironmentConfig(data)
            },
            is_environment: {
                schema: { type: "string" },
                normalize: data => this.getEnv("environment").toLowerCase() === data.toLowerCase()
            },
            env: {
                schema: { type: "string" },
                normalize: data => this.getEnv(data)
            },
            project_dir: {
                schema: { type: "string" },
                normalize: data => path.join(this.getEnv("project_dir"), data)
            },
            plugin_dir: {
                schema: { type: "string" },
                normalize: data => path.join(this.pluginDirResolver(), data)
            },
            framework_dir: {
                schema: { type: "string" },
                normalize: data => path.join(__dirname, "..", data)
            }
        };
    }

    getNormalizers() {
        return [];
    }

    getTemplateVars() {
        return { env: this.env };
    }

    getEnv(envVar) {
        if (!_.has(this.env, envVar)) {
            throw new Error(`The variable ${envVar} was not found in environment`);
        }
        return _.get(this.env, envVar);
    }

    getEnvironmentConfig(configuration) {
        const environment = this.getEnv("environment");
        const config = _.get(configuration, "default", {});
        const envConfig = _.get(configuration, environment, {});

        _.merge(config, envConfig);
        return config;
    }
}

module.exports = EnvConfigExtension;
