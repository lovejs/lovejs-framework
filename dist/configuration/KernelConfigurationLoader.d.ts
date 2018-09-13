import { ConfigurationLoader } from "@lovejs/components";
export declare class KernelConfigurationLoader extends ConfigurationLoader {
    getSchema(): any;
    getNormalizers(): {
        path: string;
        normalize: (watcher: any) => any;
    }[];
}
