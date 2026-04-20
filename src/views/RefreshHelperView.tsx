import { useEffect } from "react";
import { useAppStore } from "../zustand/app";

export function RefreshHelperView() {
    const setView = useAppStore((state) => state.setView);

    useEffect(() => {
        setView("main");
    }, [setView]);

    return <div></div>;
}
