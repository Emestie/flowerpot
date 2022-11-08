import { useSelector } from "react-redux";
import { appSelector } from "/@/redux/selectors/appSelectors";

export default () => {
    const { currentFestival } = useSelector(appSelector);

    if (!currentFestival) return null;

    const {
        icon: { height, left, path, top, width },
    } = currentFestival;

    return (
        <div style={{ position: "absolute", top: top, left: left, width: width, height: height }}>
            <img src={path} alt={""} style={{ maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
};
