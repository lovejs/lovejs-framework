const _ = require("lodash");
const chalk = require("chalk");
const sane = require("sane");
const path = require("path");
const fs = require("fs");

const { ErrorRenderer } = require("../Errors");

class KernelWatcher {
    constructor(builder, options) {
        _.defaultsDeep(options, { modules: [], folders: [], debouce: 250, glob: { app: "**/*", module: "**/*", folder: "**/*" } });
        this.builder = builder;
        this.modules = options.modules;
        this.folders = options.folders;
        this.kernel = this.builder();
        this.projectDir = this.kernel.getProjectDir();
        this.booting = false;
        this.glob = options.glob;
        this.reboot = _.debounce(this.reboot, options.debounce);
    }

    info(msg) {
        console.log(msg);
    }

    error(msg, error) {
        console.log(msg);
        if (error) {
            ErrorRenderer(error);
        }
    }

    /**
     * Boot the kernel and start the watch process
     */
    async start() {
        await this.boot();
        await this.watch();
    }

    /**
     * Boot the kernel
     */

    async boot() {
        try {
            this.booting = true;
            await this.kernel.boot();
            this.booting = false;
        } catch (error) {
            this.error(`🚨  Error booting application ${chalk.red(error.message)}`, error);
            this.booting = false;
        }
    }

    /**
     * Reboot the kernel
     */
    async reboot() {
        if (this.booting) {
            return false;
        }
        this.info("⭕️ Halting current Kernel...");
        await this.kernel.halt();
        this.info("♻️  Rebooting application...");
        try {
            this.clearCacheModules();
        } catch (error) {
            this.error(`🚨  Error reseting application ${chalk.red(error.message)}`, error);
            return;
        }
        this.kernel = this.builder();
        await this.boot();
    }

    /**
     * Clear only module in watched directory
     */
    clearCacheModules() {
        const modules = this.modules || [];
        modules.push(this.projectDir);
        const watching = modules.map(module => new RegExp(`${module}\/(?!node_modules).*`));

        _.map(require.cache, (module, modulePath) => {
            for (let watch of watching) {
                if (watch.test(modulePath)) {
                    delete require.cache[modulePath];
                    return;
                }
            }
        });

        Object.keys(module.constructor._pathCache).forEach(cacheKey => delete module.constructor._pathCache[cacheKey]);
        this.info("✂️  Cache cleared...");
    }

    /**
     * Given a module, try to resolve is real directory to watch
     */
    async getModuleDirectory(module) {
        try {
            const modulePath = require.resolve(module);
            const moduleDir = path.dirname(modulePath);
            return new Promise((resolve, reject) => {
                fs.realpath(moduleDir, (err, resolvedPath) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(resolvedPath);
                });
            });
        } catch (e) {
            return false;
        }
    }

    /**
     * Watch the kernel project dir & modules / folders
     */
    async watch() {
        let folders = this.folders || [];
        const modules = this.modules || [];
        const reboot = () => this.reboot();
        folders = folders.map(folder => (_.isString(folder) ? { path: folder, glob: this.glob.folder } : folder));
        folders.push({ path: this.projectDir, glob: this.glob.app });

        for (let module of modules) {
            if (_.isString(module)) {
                module = { name: module, glob: this.glob.module };
            }
            const modulePath = await this.getModuleDirectory(module.name);
            if (modulePath) {
                folders.push({ path: modulePath, glob: module.glob || this.glob.module });
            } else {
                console.error(`Unable to guess directory for module "${chalk.red(module.name)}"`);
            }
        }

        return Promise.all(
            _.map(folders, folder => {
                console.log(` 📂 ${folder.path} (${folder.glob})`);
                const dirPath = path.isAbsolute(folder.path) ? folder.path : path.resolve(this.projectDir, folder.path);
                const watcher = sane(dirPath, { glob: folder.glob || this.glob.folder, watchman: true });
                const handler = (type, filepath, root) => {
                    const colors = { add: "green", change: "blue", delete: "red" };
                    const icons = { add: "+", change: "*", delete: "-" };
                    const color = chalk[colors[type]];
                    const icon = icons[type];

                    console.log(`  ${color(icon)} ${root}/${color(filepath)}`);
                    reboot();
                };

                watcher.on("change", (...a) => handler("change", ...a));
                watcher.on("add", (...a) => handler("add", ...a));
                watcher.on("delete", (...a) => handler("delete", ...a));

                return new Promise((resolve, reject) => {
                    watcher.on("ready", () => resolve(true));
                });
            })
        ).then(res => {
            this.info(`👁  Waiting for changes in ${chalk.yellow(res.length)} directories...`);
        });
    }
}

module.exports = KernelWatcher;
