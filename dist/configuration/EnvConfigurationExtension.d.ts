import { ConfigurationLoaderExtensionInterface } from "@lovejs/components";
export declare class EnvConfigurationExtension implements ConfigurationLoaderExtensionInterface {
    protected getEnv: (key?: string) => any;
    protected pluginDirResolver: () => string;
    constructor(getEnv: any, pluginDirResolver: any);
    getTags(): Promise<{
        environment: {
            schema: {
                type: string;
            };
            normalize: (data: any) => Promise<any>;
        };
        is_environment: {
            schema: {
                type: string;
            };
            normalize: (data: any) => Promise<boolean>;
        };
        env: {
            schema: {
                type: string;
            };
            normalize: (data: any) => Promise<any>;
        };
        project_dir: {
            schema: {
                type: string;
            };
            normalize: (data: any) => Promise<string>;
        };
        plugin_dir: {
            schema: {
                type: string;
            };
            normalize: (data: any) => Promise<string>;
        };
        framework_dir: {
            schema: {
                type: string;
            };
            normalize: (data: any) => Promise<string>;
        };
    }>;
    getNormalizers(): Promise<any[]>;
    getTemplateVars(): {
        env: any;
    };
    getEnvironmentConfig(configuration: any): any;
}
