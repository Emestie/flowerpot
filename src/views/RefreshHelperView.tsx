import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { appViewSet } from "../redux/actions/appActions";

export function RefreshHelperView() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(appViewSet("main"));
    }, [dispatch]);

    return <div></div>;
}
