const PREFIX = "[Zustand]";

export const createLogger = <T>(name: string, initializer: (set: any, get: () => T, api: any) => T) => {
    return (set: any, get: any, api: any) => {
        const loggedSet = (partial: any, replace?: boolean) => {
            const prevState = get();
            const nextState = typeof partial === "function" ? partial(prevState) : partial;

            console.log(`${PREFIX} ${name}:`, { prev: prevState, next: nextState, change: partial });

            return set(partial, replace);
        };

        return initializer(loggedSet, get, api);
    };
};
