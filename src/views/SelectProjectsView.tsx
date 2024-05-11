import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Checkbox, Container, Header, Icon, Message } from "semantic-ui-react";
import { api } from "../api/client";
import { PageLayout } from "../components/PageLayout";
import { ViewHeading } from "../components/heading/ViewHeading";
import { Project } from "../helpers/Project";
import { IProject } from "../modules/api-client";
import { appViewSet } from "../redux/actions/appActions";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { s } from "../values/Strings";

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
            api.project.getAll().then((projects) => {
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
        availableProjects.filter((p) => p.checked).forEach((p) => Project.add(p as any)); //TODO: type
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
                <Header as="h3" dividing>
                    <span title={s("refresh")} className="externalLinkNoFloat" onClick={onRefresh}>
                        <Icon size="small" name="refresh" disabled={isLoading} />
                    </span>
                    {s("selpAvailableHeader")}
                </Header>
                {queryList}
            </Container>
        </PageLayout>
    );
}
