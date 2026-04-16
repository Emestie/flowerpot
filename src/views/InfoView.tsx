import Markdown from "markdown-to-jsx";
import { useCallback, useEffect, useState } from "react";
import { Button, Container, Icon, Message } from "semantic-ui-react";
import { PageLayout } from "../components/PageLayout";
import { ViewHeading } from "../components/heading/ViewHeading";
import { Info } from "../helpers/Info";
import { s } from "../values/Strings";
import { useAppStore } from "../zustand/app";

interface IInfoViewParams extends Record<string, any> {
    contentFileName: string;
    viewCaption?: string;
}

export function InfoView() {
    const viewParams = useAppStore((state) => state.viewParams) as IInfoViewParams;
    const [contentText, setContentText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const isMarkdown = viewParams.contentFileName.endsWith(".md");

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            const text = await Info.getInfoText(viewParams.contentFileName);
            setContentText(text);
            setIsLoading(false);

            Info.registerEventListeners(viewParams.contentFileName);
        })();
    }, [viewParams]);

    const onSave = useCallback(() => {
        useAppStore.getState().setView("main");
    }, []);

    const content = useCallback(() => {
        if (isLoading) {
            return (
                <Message icon>
                    <Icon name="circle notched" loading />
                    <Message.Content> {s("fetchingInfoPageContent")}</Message.Content>
                </Message>
            );
        }

        if (isMarkdown) {
            return <Markdown options={{ overrides: { Button: { component: Button } } }}>{contentText}</Markdown>;
        }

        return <Container fluid>{contentText}</Container>;
    }, [contentText, isLoading, isMarkdown]);

    return (
        <PageLayout
            heading={
                <ViewHeading viewCaption={viewParams.viewCaption}>
                    <Button positive onClick={onSave}>
                        {s("settingsBackButton")}
                    </Button>
                </ViewHeading>
            }
        >
            {content()}
        </PageLayout>
    );
}
