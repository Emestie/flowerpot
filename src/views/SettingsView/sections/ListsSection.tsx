import { Container, Header, Icon, Label } from "semantic-ui-react";
import { ListBlock } from "../../../components/ListBlock";
import { s } from "../../../values/Strings";

export function ListsView() {
    return (
        <>
            <Header as="h3" dividing>
                {s("sectionLists")}
            </Header>
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
                        <Icon name="arrow right" />
                    </span>
                    {s("forwarded")}
                </Header>
                {s("forwardedDescription")}
                <ListBlock listName="forwarded" />
                <Header as="h3" dividing>
                    <span>
                        <Icon name="clock outline" />
                    </span>
                    {s("deferred")}
                </Header>
                {s("deferredDescription")}
                <ListBlock listName="deferred" />
            </Container>
        </>
    );
}
