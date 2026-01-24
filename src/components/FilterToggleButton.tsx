import React from "react";
import { useSelector } from "react-redux";
import { Button, Icon, SemanticICONS } from "semantic-ui-react";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

interface FilterToggleButtonProps {
    checked: boolean;
    onChange: () => void;
    icon?: SemanticICONS;
    imgUrl?: string;
    label: string;
    visible?: boolean;
}

export const FilterToggleButton: React.FC<FilterToggleButtonProps> = ({
    checked,
    onChange,
    icon,
    imgUrl,
    label,
    visible = true,
}) => {
    const settings = useSelector(settingsSelector);

    if (!visible || (!icon && !imgUrl)) return null;

    return (
        <Button
            basic={!checked}
            onClick={onChange}
            title={label}
            className="filter-toggle-button"
            compact
            size="tiny"
            style={{ position: "relative", overflow: "hidden" }}
            icon
        >
            {icon ? (
                <Icon name={icon} style={settings.darkTheme ? { color: "white" } : undefined} />
            ) : (
                <img
                    src={imgUrl}
                    alt={label}
                    style={{ height: "11px", width: "14px", display: "inline-block", margin: "0 auto" }}
                />
            )}
            {!checked && (
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
            )}
        </Button>
    );
};
