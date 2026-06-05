import { ReactNode } from "react";

interface Props {
    heading: ReactNode;
    sidebar?: ReactNode;
    children: ReactNode;
}

export function PageLayout(props: Props) {
    return (
        <div className="PageLayout flex-col h-screen user-select-none">
            <div className="PageLayoutHeading">{props.heading}</div>
            <div className="flex" style={{ height: "100%", overflowY: "auto", padding: 0 }}>
                {props.sidebar ? <div className="PageLayoutSidebar">{props.sidebar}</div> : null}
                <div className="PageLayoutContent">{props.children}</div>
            </div>
        </div>
    );
}
