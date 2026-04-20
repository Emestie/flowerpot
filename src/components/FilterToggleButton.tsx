import { FC } from "react";
import { Button, Icon, SemanticICONS } from "semantic-ui-react";
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
    <Icon name={icon} style={isDark ? { color: "white" } : undefined} />
);

const ColorDot: FC<{ colorDot: string; label: string; isDark: boolean }> = ({ colorDot, label, isDark }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, height: "15.5px", padding: "2px 1px" }}>
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: colorDot }} />
        <span style={{ fontSize: "9px", lineHeight: 1, color: isDark ? "white" : undefined }}>
            {label.charAt(0).toUpperCase()}
        </span>
    </span>
);

const ImageRenderer: FC<{ imgUrl: string; label: string }> = ({ imgUrl, label }) => (
    <img
        src={imgUrl}
        alt={label}
        style={{ height: "14px", width: "18px", display: "inline-block", margin: "0 auto" }}
    />
);

const CrossedOutOverlay: FC = () => (
    <div
        style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "150%",
            height: "2px",
            backgroundColor: "red",
            transform: "translate(-50%, -50%) rotate(45deg)",
            pointerEvents: "none",
        }}
    />
);

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
            className={icon ? "filter-toggle-button" : "filter-toggle-button-img"}
            compact
            size="tiny"
            style={{ position: "relative", overflow: "hidden" }}
            icon
        >
            <ContentRenderer icon={icon} imgUrl={imgUrl} colorDot={colorDot} label={label} isDark={isDark} />
            {!checked && <CrossedOutOverlay />}
        </Button>
    );
};
