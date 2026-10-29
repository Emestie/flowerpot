import Markdown from "markdown-to-jsx";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";
import { Message } from "../ui/message";
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
    const locale = useAppStore((state) => state.locale);
    const [contentText, setContentText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const isMarkdown = viewParams.contentFileName.endsWith(".md");

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            const text = await Info.getInfoText(viewParams.contentFileName);
            setContentText(text);
            setIsLoading(false);
        })();
        // locale is a dependency: a translated page is re-fetched in the new language
    }, [viewParams, locale]);

    useEffect(() => {
        if (!isLoading && contentText) {
            Info.registerEventListeners(viewParams.contentFileName);
        }
    }, [isLoading, contentText, viewParams.contentFileName]);

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
                    <Button primary onClick={onSave}>
                        {s("settingsBackButton")}
                    </Button>
                </ViewHeading>
            }
        >
            {content()}
        </PageLayout>
    );
}
