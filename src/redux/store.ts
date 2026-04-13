import { applyMiddleware, combineReducers, compose, legacy_createStore as createStore, Store } from "redux";
import logger from "redux-logger";
import { thunk } from "redux-thunk";
import { IAppState, appReducer } from "./reducers/appReducer";
import { IDataState, dataReducer } from "./reducers/dataReducer";
import { ISettingsState, settingsReducer } from "./reducers/settingsReducer";
import { IAction } from "./types";

const combinedReducers = combineReducers<IStore>({
    app: appReducer as any,
    data: dataReducer as any,
    settings: settingsReducer as any,
});

const composeEnhancers =
    typeof window === "object" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
        : compose;

const composedEnhancers = composeEnhancers(applyMiddleware(thunk as any, logger as any));

export const store: Store<IStore, IAction> = createStore(combinedReducers, composedEnhancers as any);

(window as any).__store = store;

export interface IStore {
    app: IAppState;
    data: IDataState;
    settings: ISettingsState;
}
