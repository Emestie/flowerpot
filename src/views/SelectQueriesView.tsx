import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Checkbox, Container, Header, Icon, Label, Message } from "semantic-ui-react";
import { api } from "../api/client";
import { PageLayout } from "../components/PageLayout";
import { ViewHeading } from "../components/heading/ViewHeading";
import Query from "../helpers/Query";
import { IQuery } from "../modules/api-client";
import { appViewSet } from "../redux/actions/appActions";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { s } from "../values/Strings";

interface ISelectableQuery extends IQuery {
    checked: boolean;
}

export function SelectQueriesView() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);
    const [isLoading, setIsLoading] = useState(true);
    const [availableQueries, setAvailableQueries] = useState<ISelectableQuery[]>([]);
    const [showPublic, setShowPublic] = useState(false);

    const isAddAvailable = !!availableQueries.filter((q) => q.checked).length;

    const loadQueries = useCallback(() => {
        setTimeout(() => {
            api.query.getAvailable().then((queries) => {
                const currentQueriesIds = settings.queries.map((q) => q.queryId);
                const queriesToSelect = queries.filter(
                    (q) => !currentQueriesIds.includes(q.queryId)
                ) as ISelectableQuery[];
                queriesToSelect.forEach((q) => (q.checked = false));

                setAvailableQueries(queriesToSelect);
                setIsLoading(false);
            });
        }, 50);
    }, [settings.queries]);

    useEffect(() => {
        loadQueries();
    }, [loadQueries]);

    const onAdd = () => {
        availableQueries.filter((q) => q.checked).forEach((q) => Query.add(q));
        setIsLoading(true);
        setAvailableQueries([]);

        dispatch(appViewSet("settings"));
    };

    const onCancel = () => {
        setAvailableQueries([]);
        dispatch(appViewSet("settings"));
    };

    const onRefresh = () => {
        if (isLoading) return;
        setIsLoading(true);
        loadQueries();
    };

    const toggleCheck = (query: ISelectableQuery) => {
        const all = availableQueries;
        const index = all.findIndex((q) => q.queryId === query.queryId);
        all[index].checked = !all[index].checked;
        setAvailableQueries([...all]);
    };

    const filteredAvailableQueries = availableQueries.filter((x) => (showPublic ? true : !x.isPublic));

    const queryList = isLoading ? (
        <Message icon>
            <Icon name="circle notched" loading />
            <Message.Content> {s("loading")}</Message.Content>
        </Message>
    ) : filteredAvailableQueries.length ? (
        filteredAvailableQueries.map((q) => (
            <div key={q.queryId} style={{ marginBottom: 5 }}>
                <Checkbox label={q.nameInList} checked={q.checked} onChange={() => toggleCheck(q)} />
            </div>
        ))
    ) : (
        <Message visible info>
            {s("noQueriesAvailable")}
        </Message>
    );

    return (
        <PageLayout
            heading={
                <ViewHeading>
                    <Button onClick={onCancel}>{s("cancel")}</Button>
                    <Button onClick={onAdd} positive disabled={!isAddAvailable}>
                        {s("add")}
                    </Button>
                </ViewHeading>
            }
        >
            <Container fluid>
                <Label color="orange">{s("note")}</Label> {s("selqNote1")}
                <Header as="h3" dividing>
                    <span title={s("refresh")} className="externalLinkNoFloat" onClick={onRefresh}>
                        <Icon size="small" name="refresh" disabled={isLoading} />
                    </span>
                    {s("selqAvailableHeader")}
                    <span style={{ marginLeft: 20 }}>
                        <Checkbox
                            label={s("showPublicQueries")}
                            onChange={(_, a) => setShowPublic(!!a.checked)}
                            checked={showPublic}
                        />
                    </span>
                </Header>
                {queryList}
            </Container>
        </PageLayout>
    );
}
