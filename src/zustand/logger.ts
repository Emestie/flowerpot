const PREFIX = "[Zustand]";
const TAG = "\u2588";

export const createLogger = <T>(
    name: string,
    color: string,
    initializer: (set: any, get: () => T, api: any) => T
) => {
    return (set: any, get: any, api: any) => {
        const loggedSet = (partial: any, replace?: boolean) => {
            const prevState = get();
            const change = typeof partial === "function" ? partial(prevState) : partial;

            set(partial, replace);

            const nextState = get();

            console.log(
                `${PREFIX} %c${TAG}%c ${name}:`,
                `color: ${color}; font-size: 14px;`,
                "color: inherit;",
                Object.keys(change).join(", "),
                {
                    change,
                    next: nextState,
                    prev: prevState,
                }
            );
        };

        return initializer(loggedSet, get, api);
    };
};
