import { useAppStore } from "./zustand/app";
import { TView } from "./redux/types";

//TODO: debug purposes. Move somewhere
(window as any)._setView = (view: TView) => useAppStore.getState().setView(view);
