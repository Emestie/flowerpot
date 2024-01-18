import { Component, ErrorInfo, ReactNode } from "react";
import { Button, Message } from "semantic-ui-react";
import { s } from "../values/Strings";

interface Props {
    children?: ReactNode;
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
                            window.location.reload();
                        }}
                        positive
                    >
                        {s("reload")}
                    </Button>
                </div>
            );
        }

        return <>{this.props.children}</>;
    }
}
