export const APP_EVENT_COLLAPSE_ALL = "app:collapse-all";
export const APP_EVENT_EXPAND_ALL = "app:expand-all";

export const triggerCollapseAll = () => {
    document.dispatchEvent(new CustomEvent(APP_EVENT_COLLAPSE_ALL));
};

export const triggerExpandAll = () => {
    document.dispatchEvent(new CustomEvent(APP_EVENT_EXPAND_ALL));
};
