import React from "react";
import { Header, Container, Button, Icon, Label } from "semantic-ui-react";
import { s } from "../values/Strings";
import ListBlock from "../components/ListBlock";
import ViewHeading from "../components/heading/ViewHeading";
import { useDispatch } from "react-redux";
import { appViewSet } from "../redux/actions/appActions";

export function ListsView() {
    const dispatch = useDispatch();

    const onSave = () => {
        dispatch(appViewSet("settings"));
    };

    return (
        <div className="Page">
            <ViewHeading>
                <Button positive onClick={onSave}>
                    {s("save")}
                </Button>
            </ViewHeading>
            <Container fluid>
                <Label color="orange">
                    <span>{s("note")}</span>
                </Label>{" "}
                {s("listsNote")}
                <Header as="h3" dividing>
                    <span>
                        <Icon name="eye" />
                    </span>
                    {s("permawatch")}
                </Header>
                {s("permawatchDescription")}
                <ListBlock listName="permawatch" />
                <Header as="h3" dividing>
                    <span>
                        <Icon name="tags" />
                    </span>
                    {s("keywords")}
                </Header>
                {s("keywordsDescription")}
                <ListBlock listName="keywords" />
                <Header as="h3" dividing>
                    <span>
                        <Icon name="eye slash outline" />
                    </span>
                    {s("hidden")}
                </Header>
                {s("hiddenDescription")}
                <ListBlock listName="hidden" />
                <Header as="h3" dividing>
                    <span>
                        <Icon name="pin" />
                    </span>
                    {s("pinned")}
                </Header>
                {s("pinnedDescription")}
                <ListBlock listName="pinned" />
                <Header as="h3" dividing>
                    <span>
                        <Icon name="star" />
                    </span>
                    {s("favorites")}
                </Header>
                {s("favoritesDescription")}
                <ListBlock listName="favorites" />
                <Header as="h3" dividing>
                    <span>
                        <Icon name="clock outline" />
                    </span>
                    {s("deferred")}
                </Header>
                {s("deferredDescription")}
                <ListBlock listName="deferred" />
            </Container>
        </div>
    );
}
