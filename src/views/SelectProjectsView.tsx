import React, { useCallback, useEffect, useState } from "react";
import { Header, Container, Button, Message, Icon, Checkbox } from "semantic-ui-react";
import Loaders from "../helpers/Loaders";
import { s } from "../values/Strings";
import { ViewHeading } from "../components/heading/ViewHeading";
import { useDispatch, useSelector } from "react-redux";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { appViewSet } from "../redux/actions/appActions";
import { IProject, Project } from "../helpers/Project";

interface ISelectableProject extends IProject {
    checked: boolean;
}

export function SelectProjectsView() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);
    const [isLoading, setIsLoading] = useState(true);
    const [availableProjects, setAvailableProjects] = useState<ISelectableProject[]>([]);

    const isAddAvailable = !!availableProjects.filter((q) => q.checked).length;

    const loadProjects = useCallback(() => {
        setTimeout(() => {
            Loaders.loadCollectionsAndProjects().then(({ projects }) => {
                const currentProjectPaths = settings.projects.map((p) => p.path);
                const projectsToSelect = projects.filter(
                    (p) => !currentProjectPaths.includes(p.path)
                ) as ISelectableProject[];
                projectsToSelect.forEach((p) => (p.checked = false));

                setAvailableProjects(projectsToSelect);
                setIsLoading(false);
            });
        }, 50);
    }, [settings.projects]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const onAdd = () => {
        availableProjects.filter((p) => p.checked).forEach((p) => Project.add(p));
        setIsLoading(true);
        setAvailableProjects([]);

        dispatch(appViewSet("settings"));
    };

    const onCancel = () => {
        setAvailableProjects([]);
        dispatch(appViewSet("settings"));
    };

    const onRefresh = () => {
        setIsLoading(true);
        loadProjects();
    };

    const toggleCheck = (project: ISelectableProject) => {
        const all = availableProjects;
        const index = all.findIndex((p) => p.path === project.path);
        all[index].checked = !all[index].checked;
        setAvailableProjects([...all]);
    };

    const queryList = isLoading ? (
        <Message icon>
            <Icon name="circle notched" loading />
            <Message.Content> {s("loading")}</Message.Content>
        </Message>
    ) : availableProjects.length ? (
        availableProjects.map((p) => (
            <div key={p.path} style={{ marginBottom: 5 }}>
                <Checkbox
                    label={p.collectionName + " / " + p.name}
                    checked={p.checked}
                    onChange={() => toggleCheck(p)}
                />
            </div>
        ))
    ) : (
        <Message visible color="red">
            {s("noProjectsAvailable")}
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
                <Header as="h3" dividing>
                    {s("selpAvailableHeader")}{" "}
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
