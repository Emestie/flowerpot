import { useSelector } from "react-redux";
import flowerpotLogo from "../../assets/flower4.png";
import { IFestivalDescriptor } from "/@/helpers/Festival";
import { appSelector } from "/@/redux/selectors/appSelectors";

const defaultLogo: IFestivalDescriptor = {
    icon: { width: 28, height: 28, left: 16, top: 16, offset: 0, path: flowerpotLogo },
    dateFrom: "",
    dateTo: "",
    name: "",
};

export default () => {
    const { currentFestival } = useSelector(appSelector);

    const _currentFestival = currentFestival ?? defaultLogo;

    const {
        icon: { height, left, path, top, width },
    } = _currentFestival;

    return (
        <div style={{ position: "absolute", top: top, left: left, width: width, height: height }}>
            <img src={path} alt={""} style={{ maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
};
