import { Button, Container, Icon, Menu } from "semantic-ui-react";
import { LocalVersionBanner } from "../../components/LocalVersionBanner";
import { ViewHeading } from "../../components/heading/ViewHeading";
import { isDarkTheme } from "../../helpers/Theme";
import { TTheme } from "../../helpers/Settings";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { useSettingsStore } from "../../zustand/settings";
import { AccountSection } from "./sections/AccountSection";
import { CreditsSection } from "./sections/CreditsSection";
import { ImportSection } from "./sections/ImportSection";
import { ListsView } from "./sections/ListsSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { QueriesSection } from "./sections/QueriesSection";
import { QuickLinksSections } from "./sections/QuickLinksSections";
import { WorkItemsSection } from "./sections/WorkItemsSection";
import { PageLayout } from "/@/components/PageLayout";
import { Sections } from "../../zustand/settings";

const sectionsList = [
    {
        id: Sections.Account,
        captionKey: "sectionAccount",
    },
    {
        id: Sections.Queries,
        captionKey: "sectionQueries",
    },
    {
        id: Sections.Projects,
        captionKey: "sectionProjects",
    },
    {
        id: Sections.Lists,
        captionKey: "sectionLists",
    },
    {
        id: Sections.WorkItems,
        captionKey: "sectionWI",
    },
    {
        id: Sections.QuickLinks,
        captionKey: "sectionQL",
    },
    {
        id: Sections.Import,
        captionKey: "sectionImport",
    },
    {
        id: Sections.Credits,
        captionKey: "sectionCredits",
    },
];

const getSectionComponent = (sectionId: Sections) => {
    switch (sectionId) {
        case Sections.Account:
            return <AccountSection />;
        case Sections.Credits:
            return <CreditsSection />;
        case Sections.WorkItems:
            return <WorkItemsSection />;
        case Sections.Projects:
            return <ProjectsSection />;
        case Sections.Queries:
            return <QueriesSection />;
        case Sections.QuickLinks:
            return <QuickLinksSections />;
        case Sections.Lists:
            return <ListsView />;
        case Sections.Import:
            return <ImportSection />;
        default:
            return <></>;
    }
};

export function SettingsView() {
    const settingsSection = useSettingsStore((state) => state.settingsSection);
    const theme = useSettingsStore((state) => state.theme);
    const accounts = useSettingsStore((state) => state.accounts);
    const setView = useAppStore((state) => state.setView);

    const toggleTheme = () => {
        const themes: TTheme[] = ["light", "dark", "system"];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        useSettingsStore.getState().setTheme(themes[nextIndex]);
    };

    const getThemeIcon = () => {
        switch (theme) {
            case "light":
                return <Icon name="sun" />;
            case "dark":
                return <Icon name="moon" />;
            case "system":
                return <Icon name="desktop" />;
        }
    };

    const getThemeTitle = () => {
        switch (theme) {
            case "light":
                return s("themeLight");
            case "dark":
                return s("themeDark");
            case "system":
                return s("themeSystem");
        }
    };

    const onSave = () => {
        setView("main");
    };

    const sectionsMenuItems = sectionsList
        .filter((section) => {
            if (!accounts?.length)
                return (
                    section.id === Sections.Account || section.id === Sections.Credits || section.id === Sections.Import
                );
            return true;
        })
        .map((section, i) => (
            <Menu.Item
                key={i}
                as="a"
                active={section.id === settingsSection}
                onClick={() => useSettingsStore.getState().setSettingsSection(section.id)}
            >
                {s(section.captionKey as any)}
            </Menu.Item>
        ));

    const sectionComponent = getSectionComponent(settingsSection);

    return (
        <PageLayout
            heading={
                <ViewHeading>
                    <LocalVersionBanner />
                    <Button icon onClick={toggleTheme} title={getThemeTitle()}>
                        {getThemeIcon()}
                    </Button>
                    <Button positive onClick={onSave}>
                        {s("settingsBackButton")}
                    </Button>
                </ViewHeading>
            }
            sidebar={
                <Menu inverted={isDarkTheme(theme)} vertical size="small" secondary>
                    {sectionsMenuItems}
                </Menu>
            }
        >
            <Container fluid>{sectionComponent}</Container>
        </PageLayout>
    );
}
