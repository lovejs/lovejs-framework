import * as _ from "lodash";

export const MiddlewaresListener = resolver => {
    return async event => {
        const context = event.getData();
        const middlewares = _.toPairs(context.getAttribute("_middlewares"));

        return await resolver.processMiddlewares(middlewares, [context]);
    };
};
