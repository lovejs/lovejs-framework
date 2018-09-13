import * as _ from "lodash";
import chalk, { Chalk } from "chalk";
import * as sane from "sane";
import * as path from "path";
import * as fs from "fs";

import { ErrorRenderer } from "../errors";

import { Kernel } from "./Kernel";

/**
 * The Kernel watcher watch for changes in the project dir and optionnals modules and/or folders.
 * If a change is detected, the module cache is clear and the kernel reboot
 */
export class KernelWatcher {
    /**
     * Kernel builder function
     */
    protected builder: (...a) => Kernel;

    /**
     * List of modules to watch for changes
     */
    protected modules: string[];

    /**
     * List of folders to watch for changes
     */
    protected folders: string[];

    /**
     * The current kernel instance
     */
    protected kernel: Kernel;

    /**
     * The project directory
     */
    protected projectDir: string;

    /**
     * Is the kernel currently booting
     */
    protected booting: boolean;

    /**
     * List of glob pattern to use for app watching, module watching and folder watching
     */
    protected glob: { app: string; module: string; folder: string };

    /**
     * Debonced method to reboot the kernel
     */
    protected reboot: () => Promise<void>;

    constructor(builder, options) {
        _.defaultsDeep(options, { modules: [], folders: [], debouce: 250, glob: { app: "**/*", module: "**/*", folder: "**/*" } });
        this.builder = builder;
        this.modules = options.modules;
        this.folders = options.folders;
        this.kernel = this.builder();
        this.projectDir = this.kernel.getProjectDir();
        this.booting = false;
        this.glob = options.glob;
        this.reboot = _.debounce(this.doReboot, options.debounce);
    }

    /**
     * Display an info message
     * @param msg Message to display
     */
    info(msg: string) {
        console.log(msg);
    }

    /**
     * Display an error message
     * @param msg Error message
     * @param error The raised error
     */
    error(msg: string, error: Error) {
        console.error(msg);
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
    async doReboot() {
        if (this.booting) {
            return;
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
        // @ts-ignore
        Object.keys(module.constructor._pathCache).forEach(cacheKey => delete module.constructor._pathCache[cacheKey]);
        this.info("✂️  Cache cleared...");
    }

    /**
     * Given a module, try to resolve is real directory to watch
     */
    async getModuleDirectory(module): Promise<any> {
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
     * Watch the kernel project dir, specified modules and folders
     */
    async watch() {
        let folders: { path: string; glob: any }[] = [];
        folders = this.folders.map(folder => (_.isString(folder) ? { path: folder, glob: this.glob.folder } : folder));
        folders.push({ path: this.projectDir, glob: this.glob.app });

        for (let name of this.modules) {
            const module = _.isString(name) ? { name, glob: this.glob.module } : name;
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
                const handler = (type: string, filepath: string, root: string, fstats?) => {
                    const colors = { add: "green", change: "blue", delete: "red" };
                    const icons = { add: "+", change: "*", delete: "-" };
                    const color = chalk[colors[type]];
                    const icon = icons[type];

                    console.log(`  ${color(icon)} ${root}/${color(filepath)}`);
                    this.reboot();
                };

                watcher.on("change", (...a) => handler("change", ...a));
                watcher.on("add", (...a) => handler("add", ...a));
                watcher.on("delete", (...a) => handler("delete", ...a));

                return new Promise((resolve, reject) => {
                    watcher.on("ready", () => resolve(true));
                });
            })
        ).then(results => {
            this.info(`👁  Waiting for changes in ${chalk.yellow(String(results.length))} directories...`);
        });
    }
}
