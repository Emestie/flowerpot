const PREFIX = "[Zustand]";

export const createLogger = <T>(name: string, initializer: (set: any, get: () => T, api: any) => T) => {
    return (set: any, get: any, api: any) => {
        const loggedSet = (partial: any, replace?: boolean) => {
            const prevState = get();
            const change = typeof partial === "function" ? partial(prevState) : partial;

            set(partial, replace);

            const nextState = get();

            console.log(`${PREFIX} ${name}:`, { prev: prevState, change: change, next: nextState });
        };

        return initializer(loggedSet, get, api);
    };
};
