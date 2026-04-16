import flowerpotLogo from "../../assets/flower4.png";
import { IFestivalDescriptor } from "/@/helpers/Festival";
import { useAppStore } from "/@/zustand/app";

export const defaultFestivalIcon: IFestivalDescriptor = {
    icon: { width: 28, height: 28, left: 16, top: 16, offset: 40, path: flowerpotLogo },
    dateFrom: "",
    dateTo: "",
    name: "",
};

export function FestivalBanner() {
    const currentFestival = useAppStore((state) => state.currentFestival);

    const _currentFestival = currentFestival ?? defaultFestivalIcon;

    const {
        icon: { height, left, path, top, width },
    } = _currentFestival;

    return (
        <div style={{ position: "absolute", top: top, left: left, width: width, height: height }}>
            <img src={path} alt={""} style={{ maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
}
