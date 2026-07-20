import type { ReactNode } from "react";

export interface DropdownItemProps {
    key: string | number;
    text: ReactNode;
    value: string | number;
    disabled?: boolean;
    icon?: string;
    image?: string;
    description?: string;
    className?: string;
}
