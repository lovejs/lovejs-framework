export default {
    type: "object",
    properties: {
        watcher: {
            oneOf: [
                { type: "boolean" },
                {
                    type: "object",
                    properties: {
                        enabled: { type: "boolean" },
                        folders: {
                            type: "array",
                            items: {
                                oneOf: [
                                    { type: "string" },
                                    {
                                        type: "object",
                                        required: ["path"],
                                        properties: {
                                            path: { type: "string" },
                                            glob: {
                                                oneOf: [{ type: "array", items: { type: "string" } }, { type: "string" }]
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            ],
            errorMessage: {
                oneOf: "Watcher config entry must be a boolean or an object"
            }
        },
        logger: {
            type: "object",
            additionalProperties: {
                type: "object",
                properties: {
                    transports: {
                        type: "array",
                        items: {
                            type: "object"
                        }
                    }
                }
            }
        }
    }
};
