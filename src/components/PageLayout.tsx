import { ReactNode } from "react";

interface Props {
    heading: ReactNode;
    sidebar?: ReactNode;
    children: ReactNode;
}

export function PageLayout(props: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <div style={{ padding: 15 }}>{props.heading}</div>
            <div style={{ display: "flex", height: "100%", overflowY: "auto", padding: 0 }}>
                {props.sidebar ? <div style={{ paddingLeft: 10 }}>{props.sidebar}</div> : null}
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        overflowY: "auto",
                        paddingLeft: 10,
                        paddingRight: 10,
                        paddingBottom: 10,
                    }}
                >
                    {props.children}
                </div>
            </div>
        </div>
    );
}
