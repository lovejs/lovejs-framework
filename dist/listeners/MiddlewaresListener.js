"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
exports.MiddlewaresListener = resolver => {
    return async (event) => {
        const context = event.getData();
        const middlewares = _.toPairs(context.getAttribute("_middlewares"));
        return await resolver.processMiddlewares(middlewares, [context]);
    };
};
