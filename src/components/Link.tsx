import { ReactNode } from "react";
import Platform, { PlatformType } from "../helpers/Platform";

export function Link(props: { className?: string; href: string; children?: ReactNode }) {
    return (
        <a
            className={"url-link " + (props.className || "")}
            href={Platform.type === PlatformType.Web ? props.href : undefined}
            onMouseDown={(e) => {
                if (e.button === 1 && Platform.type === PlatformType.Electron) {
                    e.preventDefault();
                    Platform.current.openUrl(props.href);
                }
            }}
            onClick={(e) => {
                e.preventDefault();
                Platform.current.openUrl(props.href);
            }}
        >
            {props.children}
        </a>
    );
}
