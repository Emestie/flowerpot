import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Checkbox, Container, Header, Icon, Label, Message } from "semantic-ui-react";
import { api } from "../api/client";
import { ViewHeading } from "../components/heading/ViewHeading";
import Query, { IQuery } from "../helpers/Query";
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

    const isAddAvailable = !!availableQueries.filter((q) => q.checked).length;

    const loadQueries = useCallback(() => {
        setTimeout(() => {
            api.query.getAvailable().then((queries) => {
                const currentQueriesIds = settings.queries.map((q) => q.queryId);
                const queriesToSelect = queries.filter(
                    (q) => !currentQueriesIds.includes(q.queryId),
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
        setIsLoading(true);
        loadQueries();
    };

    const toggleCheck = (query: ISelectableQuery) => {
        const all = availableQueries;
        const index = all.findIndex((q) => q.queryId === query.queryId);
        all[index].checked = !all[index].checked;
        setAvailableQueries([...all]);
    };

    const queryList = isLoading ? (
        <Message icon>
            <Icon name="circle notched" loading />
            <Message.Content> {s("loading")}</Message.Content>
        </Message>
    ) : availableQueries.length ? (
        availableQueries.map((q) => (
            <div key={q.queryId} style={{ marginBottom: 5 }}>
                <Checkbox
                    label={q.collectionName + " / " + q.teamName + " / " + q.queryName}
                    checked={q.checked}
                    onChange={() => toggleCheck(q)}
                />
            </div>
        ))
    ) : (
        <Message visible color="red">
            {s("noQueriesAvailable")}
        </Message>
    );

    return (
        <div className="Page">
            <ViewHeading>
                <Button onClick={onCancel}>{s("cancel")}</Button>
                <Button onClick={onAdd} positive disabled={!isAddAvailable}>
                    {s("add")}
                </Button>
            </ViewHeading>
            <Container fluid>
                <Label color="orange">{s("note")}</Label> {s("selqNote1")}
                <b>{s("selqNote4")}</b>
                {s("selqNote5")}
                <Header as="h3" dividing>
                    {s("selqAvailableHeader")}{" "}
                    <span>
                        <Button compact size="tiny" onClick={onRefresh} disabled={isLoading}>
                            {s("refresh")}
                        </Button>
                    </span>
                </Header>
                {queryList}
            </Container>
        </div>
    );
}
