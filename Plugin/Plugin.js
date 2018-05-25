const path = require("path");
const _ = require("lodash");

class Plugin {
    constructor(dirname, configuration, { project_dir, plugins }) {
        this.dirname = dirname;
        this.configuration = configuration;
        this.plugins = plugins.map(p => p.toLowerCase());
        this.project_dir = project_dir;
    }

    hasPlugin(name) {
        return this.plugins.includes(name.toLowerCase());
    }

    getRawConfig() {
        return this.configuration;
    }

    getPluginDir(filename) {
        return filename ? path.join(this.dirname, filename) : this.dirname;
    }

    getProjectDir(filename) {
        return filename ? path.join(this.project_dir, filename) : this.dirname;
    }

    get(key = false, defaultValue = false) {
        if (!key) {
            return this.configuration;
        } else {
            return _.get(this.configuration, key, defaultValue);
        }
    }

    async boot(container, isCli) {
        return false;
    }

    async halt() { }
}

module.exports = Plugin;
