import { FC } from "react";
import { Button } from "../ui/button";
import { Icon, SemanticICONS as SuiICONS } from "semantic-ui-react";
import { SemanticICONS } from "../ui/icon/semantic-icons";
import { isDarkTheme } from "../helpers/Theme";
import { useSettingsStore } from "../zustand/settings";

interface FilterToggleButtonProps {
    checked: boolean;
    onChange: () => void;
    icon?: SemanticICONS;
    imgUrl?: string;
    label: string;
    visible?: boolean;
    colorDot?: string;
    hintPrefix?: string;
}

const IconRenderer: FC<{ icon: SemanticICONS; isDark: boolean }> = ({ icon, isDark }) => (
    <Icon name={icon as SuiICONS} className={isDark ? "filter-icon-dark" : undefined} />
);

const ColorDot: FC<{ colorDot: string; label: string; isDark: boolean }> = ({ colorDot, label, isDark }) => (
    <span className="color-dot">
        <span className="color-dot-circle" style={{ backgroundColor: colorDot }} />
        <span className={`font-xxs line-h-1${isDark ? " filter-label-dark" : ""}`}>
            {label.charAt(0).toUpperCase()}
        </span>
    </span>
);

const ImageRenderer: FC<{ imgUrl: string; label: string }> = ({ imgUrl, label }) => (
    <img src={imgUrl} alt={label} className="filter-img" />
);

const CrossedOutOverlay: FC = () => <div className="crossed-out-overlay" />;

const ContentRenderer: FC<{
    icon?: SemanticICONS;
    imgUrl?: string;
    colorDot?: string;
    label: string;
    isDark: boolean;
}> = ({ icon, imgUrl, colorDot, label, isDark }) => {
    if (icon) return <IconRenderer icon={icon} isDark={isDark} />;
    if (colorDot) return <ColorDot colorDot={colorDot} label={label} isDark={isDark} />;
    if (imgUrl) return <ImageRenderer imgUrl={imgUrl} label={label} />;
    return null;
};

export const FilterToggleButton: FC<FilterToggleButtonProps> = ({
    checked,
    onChange,
    icon,
    imgUrl,
    label,
    visible = true,
    colorDot,
    hintPrefix = "",
}) => {
    const theme = useSettingsStore((state) => state.theme);
    const isDark = isDarkTheme(theme);

    if (!visible || (!icon && !imgUrl && !colorDot)) return null;

    return (
        <Button
            basic={!checked}
            onClick={onChange}
            title={hintPrefix + label}
            className={`filter-btn ${icon ? "filter-toggle-button" : "filter-toggle-button-img"}`}
            compact
            size="tiny"
            icon
        >
            <ContentRenderer icon={icon} imgUrl={imgUrl} colorDot={colorDot} label={label} isDark={isDark} />
            {!checked && <CrossedOutOverlay />}
        </Button>
    );
};
