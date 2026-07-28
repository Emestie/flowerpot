import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "../ui/button";
import { Message } from "../ui/message";
import { s } from "../values/Strings";

interface Props {
    children?: ReactNode;
    onRemount?: () => void;
}

interface State {
    hasError: boolean;
    errorText?: string;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorText: undefined,
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            errorText: error.message || "Unknown error",
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ margin: 15 }}>
                    <h3>{s("appFatalError")}</h3>
                    <Message color="red">{this.state.errorText}</Message>
                    <Button
                        onClick={() => {
                            this.props.onRemount?.();
                        }}
                        primary
                    >
                        {s("reload")}
                    </Button>
                </div>
            );
        }

        return <>{this.props.children}</>;
    }
}
