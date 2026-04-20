import { useCallback, useEffect, useState } from "react";
import { Button, Checkbox, Container, Header, Icon, Message } from "semantic-ui-react";
import { getApi } from "../api/client";
import { AccountBadge } from "../components/AccountBadge";
import { PageLayout } from "../components/PageLayout";
import { ViewHeading } from "../components/heading/ViewHeading";
import { ProjectHelper } from "../helpers/Project";
import { Project } from "../models/project";
import { useAppStore } from "../zustand/app";
import { useSettingsStore } from "../zustand/settings";
import { s } from "../values/Strings";

interface ISelectableProject extends Project {
    checked: boolean;
}

export function SelectProjectsView() {
    const setView = useAppStore((s) => s.setView);
    const accounts = useSettingsStore((state) => state.accounts);
    const projects = useSettingsStore((state) => state.projects) || [];
    const [isLoading, setIsLoading] = useState(true);
    const [availableProjects, setAvailableProjects] = useState<ISelectableProject[]>([]);

    const isAddAvailable = !!availableProjects.filter((q) => q.checked).length;

    const loadProjects = useCallback(() => {
        setTimeout(() => {
            Promise.all(
                accounts.map((account) => {
                    return getApi(account.id)
                        .project.getAll()
                        .then((projects) => {
                            const currentProjectPaths = projects
                                .filter((x) => x.accountId === account.id)
                                .map((p) => p.path);
                            const projectsToSelect = projects.filter(
                                (p) => !currentProjectPaths.includes(p.path)
                            ) as ISelectableProject[];
                            projectsToSelect.forEach((p) => (p.checked = false));

                            return projectsToSelect;
                        });
                })
            ).then((projectsToSelect) => {
                setAvailableProjects(projectsToSelect.flat());
                setIsLoading(false);
            });
        }, 50);
    }, [projects]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const onAdd = () => {
        availableProjects.filter((p) => p.checked).forEach((p) => ProjectHelper.add(p as any)); //TODO: type
        setIsLoading(true);
        setAvailableProjects([]);

        setView("settings");
    };

    const onCancel = () => {
        setAvailableProjects([]);
        setView("settings");
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

    const projectList = isLoading ? (
        <Message icon>
            <Icon name="circle notched" loading />
            <Message.Content> {s("loading")}</Message.Content>
        </Message>
    ) : availableProjects.length ? (
        availableProjects.map((p) => (
            <div key={p.path} style={{ marginBottom: 6, display: "flex", alignItems: "center" }}>
                <AccountBadge accountId={p.accountId} rightGap={8} />
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
                {projectList}
            </Container>
        </PageLayout>
    );
}
