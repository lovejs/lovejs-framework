export const RouteListener = router => {
    return async event => {
        const context = event.getData();
        return await router.getMatchingRoute(context);
    };
};
