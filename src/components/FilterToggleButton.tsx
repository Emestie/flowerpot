import React from "react";
import { Button, Icon, SemanticICONS } from "semantic-ui-react";

interface FilterToggleButtonProps {
    checked: boolean;
    onChange: () => void;
    icon: SemanticICONS;
    label: string;
    visible?: boolean;
}

export const FilterToggleButton: React.FC<FilterToggleButtonProps> = ({
    checked,
    onChange,
    icon,
    label,
    visible = true,
}) => {
    if (!visible) return null;
    return (
        <Button
            basic={!checked}
            active={checked}
            onClick={onChange}
            title={label}
            className="filter-toggle-button"
            compact
            size="tiny"
            style={{ position: "relative", overflow: "hidden" }}
            toggle
            icon
        >
            <Icon name={icon} />
            {!checked && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "150%",
                        height: "3px",
                        backgroundColor: "red",
                        transform: "translate(-50%, -50%) rotate(45deg)",
                        pointerEvents: "none",
                    }}
                />
            )}
        </Button>
    );
};
