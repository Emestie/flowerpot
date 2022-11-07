import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { appReducer, IAppState } from "./reducers/appReducer";
import { dataReducer, IDataState } from "./reducers/dataReducer";
import { ISettingsState, settingsReducer } from "./reducers/settingsReducer";
import logger from "redux-logger";
import thunk from "redux-thunk";

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

export interface IStore {
    app: IAppState;
    data: IDataState;
    settings: ISettingsState;
}
