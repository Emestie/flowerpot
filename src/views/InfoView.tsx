import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Icon, Message } from "semantic-ui-react";
import { ViewHeading } from "../components/heading/ViewHeading";
import { Info } from "../helpers/Info";
import { appViewSet } from "../redux/actions/appActions";
import { IAppState } from "../redux/reducers/appReducer";
import { appSelector } from "../redux/selectors/appSelectors";
import { s } from "../values/Strings";
import Markdown from "markdown-to-jsx";

interface IInfoViewParams extends Record<string, any> {
    contentFileName: string;
    viewCaption?: string;
}

export function InfoView() {
    const { viewParams } = useSelector(appSelector) as IAppState<IInfoViewParams>;
    const dispatch = useDispatch();
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
        dispatch(appViewSet("main"));
    }, [dispatch]);

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
        <div className="Page">
            <ViewHeading viewCaption={viewParams.viewCaption}>
                <Button positive onClick={onSave}>
                    {s("settingsBackButton")}
                </Button>
            </ViewHeading>
            {content()}
        </div>
    );
}
