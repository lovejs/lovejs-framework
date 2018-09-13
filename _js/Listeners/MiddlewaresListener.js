const _ = require("lodash");

const listener = resolver => {
    return async event => {
        const context = event.getData();
        const middlewares = _.toPairs(context.getAttribute("_middlewares"));

        return await resolver.processMiddlewares(middlewares, [context]);
    };
};

module.exports = listener;
