import { appViewSet } from "./redux/actions/appActions";
import { store } from "./redux/store";
import { TView } from "./redux/types";

//TODO: debug purposes. Move somewhere
(window as any)._setView = (view: TView) => store.dispatch(appViewSet(view));
