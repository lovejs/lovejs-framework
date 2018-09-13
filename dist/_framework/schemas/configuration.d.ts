declare const _default: {
    type: string;
    properties: {
        watcher: {
            oneOf: ({
                type: string;
                properties?: undefined;
            } | {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    folders: {
                        type: string;
                        items: {
                            oneOf: ({
                                type: string;
                                required?: undefined;
                                properties?: undefined;
                            } | {
                                type: string;
                                required: string[];
                                properties: {
                                    path: {
                                        type: string;
                                    };
                                    glob: {
                                        oneOf: ({
                                            type: string;
                                            items: {
                                                type: string;
                                            };
                                        } | {
                                            type: string;
                                            items?: undefined;
                                        })[];
                                    };
                                };
                            })[];
                        };
                    };
                };
            })[];
            errorMessage: {
                oneOf: string;
            };
        };
        logger: {
            type: string;
            additionalProperties: {
                type: string;
                properties: {
                    transports: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
            };
        };
    };
};
export default _default;
