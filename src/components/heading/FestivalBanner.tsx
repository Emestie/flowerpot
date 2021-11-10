import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Festival from "../../helpers/Festival";
import { appSet } from "../../redux/actions/appActions";

export default React.memo(() => {
    const dispatch = useDispatch();

    const [src, top, left, width, height, headerOffset, altText] = Festival.getFestivalHeaderIcon();

    useEffect(() => {
        if (src) {
            const isFestivalOn = true;
            const festivalHeaderOffset = headerOffset ? +headerOffset : 40;
            dispatch(appSet({ isFestivalOn, festivalHeaderOffset }));
        }
    }, [src, headerOffset, dispatch]);

    if (!src) return null;

    return (
        <div style={{ position: "absolute", top: top || 8, left: left || 6, width: width || 25, height: height || 25 }}>
            <img src={src as string} alt={altText || ""} style={{ maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
});
