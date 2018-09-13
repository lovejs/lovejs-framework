"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const components_1 = require("@lovejs/components");
const schema = require("../../_framework/schemas/configuration");
class KernelConfigurationLoader extends components_1.ConfigurationLoader {
    getSchema() {
        return schema;
    }
    getNormalizers() {
        return _.concat(super.getNormalizers(), [
            {
                path: "watcher",
                normalize: watcher => (_.isBoolean(watcher) ? { enabled: true, folders: [] } : watcher)
            },
            {
                path: "watcher.folders",
                normalize: folders => _.map(folders, folder => (_.isString(folder) ? { path: folder, glob: ["**/*.{js,yaml,yml}"] } : folder))
            },
            {
                path: "logger",
                normalize: logger => {
                    if (!logger) {
                        return { default: { transports: [{ console: [] }] } };
                    }
                    else {
                        return logger.transports ? { default: logger } : logger;
                    }
                }
            }
        ]);
    }
}
exports.KernelConfigurationLoader = KernelConfigurationLoader;
