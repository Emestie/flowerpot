import { ReactNode } from "react";

interface Props {
    heading: ReactNode;
    sidebar?: ReactNode;
    children: ReactNode;
}

export function PageLayout(props: Props) {
    return (
        <div
            className="PageLayout"
            style={{ display: "flex", flexDirection: "column", height: "100vh", userSelect: "none" }}
        >
            <div className="PageLayoutHeading">{props.heading}</div>
            <div style={{ display: "flex", height: "100%", overflowY: "auto", padding: 0 }}>
                {props.sidebar ? <div className="PageLayoutSidebar">{props.sidebar}</div> : null}
                <div className="PageLayoutContent">{props.children}</div>
            </div>
        </div>
    );
}
