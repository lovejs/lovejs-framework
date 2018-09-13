"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteListener = router => {
    return async (event) => {
        const context = event.getData();
        return await router.getMatchingRoute(context);
    };
};
