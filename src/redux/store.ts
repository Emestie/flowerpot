import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import { IAppState, appReducer } from "./reducers/appReducer";
import { IDataState, dataReducer } from "./reducers/dataReducer";
import { ISettingsState, settingsReducer } from "./reducers/settingsReducer";

const combinedReducers = combineReducers<IStore, any>({
    app: appReducer,
    data: dataReducer,
    settings: settingsReducer,
});

const composeEnhancers =
    typeof window === "object" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
        : compose;

const composedEnhancers = composeEnhancers(applyMiddleware(thunk, logger));

export const store = createStore(combinedReducers, composedEnhancers);

(window as any).__store = store;

export interface IStore {
    app: IAppState;
    data: IDataState;
    settings: ISettingsState;
}
