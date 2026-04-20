import { TView } from "./types";
import { useAppStore } from "./zustand/app";

//TODO: debug purposes. Move somewhere
(window as any)._setView = (view: TView) => useAppStore.getState().setView(view);
