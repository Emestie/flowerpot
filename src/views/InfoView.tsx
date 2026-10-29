import Markdown from "markdown-to-jsx";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";
import { Message } from "../ui/message";
import { PageLayout } from "../components/PageLayout";
import { ViewHeading } from "../components/heading/ViewHeading";
import { Info } from "../helpers/Info";
import { groupChangelogByPlant } from "../helpers/VersionPlants";
import { s } from "../values/Strings";
import { useAppStore } from "../zustand/app";

interface IInfoViewParams extends Record<string, any> {
    contentFileName: string;
    viewCaption?: string;
}

/** The release notes, the only pages that carry release plants. */
const CHANGELOG_PAGES = ["changelog.md", "changelog-old.md"];

export function InfoView() {
    const viewParams = useAppStore((state) => state.viewParams) as IInfoViewParams;
    const locale = useAppStore((state) => state.locale);
    const [contentText, setContentText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const isMarkdown = viewParams.contentFileName.endsWith(".md");
    const isChangelog = CHANGELOG_PAGES.includes(viewParams.contentFileName);

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            const text = await Info.getInfoText(viewParams.contentFileName);

            setContentText(text);
            setIsLoading(false);
        })();
        // locale is a dependency: a translated page is re-fetched in the new language
    }, [viewParams, locale]);

    const groups = useMemo(
        () => (isChangelog ? groupChangelogByPlant(contentText) : [{ markdown: contentText }]),
        [isChangelog, contentText]
    );

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

        if (!isMarkdown) {
            return <Container fluid>{contentText}</Container>;
        }

        return groups.map((group, i) => (
            <Fragment key={i}>
                {group.plant && (
                    <div className="version-plant-hero">
                        <img className="version-plant-hero-art" src={group.plant.art} alt={group.plant.name} />
                    </div>
                )}
                <Markdown options={{ overrides: { Button: { component: Button } } }}>{group.markdown}</Markdown>
            </Fragment>
        ));
    }, [contentText, groups, isLoading, isMarkdown]);

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
