import { Container, Button, Icon, Sidebar, Menu } from "semantic-ui-react";
import { s } from "../../values/Strings";
import { LocalVersionBanner } from "../../components/LocalVersionBanner";
import { ViewHeading } from "../../components/heading/ViewHeading";
import { appSettingsSectionSet, appViewSet } from "../../redux/actions/appActions";
import { useDispatch, useSelector } from "react-redux";
import { settingsUpdate } from "../../redux/actions/settingsActions";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { AccountSection } from "./sections/AccountSection";
import { CreditsSection } from "./sections/CreditsSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { QueriesSection } from "./sections/QueriesSection";
import { QuickLinksSections } from "./sections/QuickLinksSections";
import { WorkItemsSection } from "./sections/WorkItemsSection";
import { appSelector } from "../../redux/selectors/appSelectors";
import { Sections } from "../../redux/reducers/appReducer";
import { StatsSection } from "./sections/StatsSection";

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
        id: Sections.WorkItems,
        captionKey: "sectionWI",
    },
    {
        id: Sections.Projects,
        captionKey: "sectionProjects",
    },
    {
        id: Sections.QuickLinks,
        captionKey: "sectionQL",
    },
    {
        id: Sections.Stats,
        captionKey: "sectionStats",
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
        case Sections.Stats:
            return <StatsSection />;
        default:
            return <></>;
    }
};

export function SettingsView() {
    const dispatch = useDispatch();

    const settings = useSelector(settingsSelector);
    const { settingsSection } = useSelector(appSelector);

    const toggleTheme = () => {
        const darkTheme = !settings.darkTheme;
        dispatch(settingsUpdate({ darkTheme }));
    };

    const onSave = () => {
        dispatch(appViewSet("main"));
    };

    const sectionsMenuItems = sectionsList.map((section, i) => (
        <Menu.Item
            key={i}
            as="a"
            active={section.id === settingsSection}
            onClick={() => dispatch(appSettingsSectionSet(section.id))}
        >
            {s(section.captionKey)}
        </Menu.Item>
    ));

    const sectionComponent = getSectionComponent(settingsSection);

    return (
        <div className="Page">
            <ViewHeading>
                <LocalVersionBanner />
                <Button icon onClick={toggleTheme}>
                    {settings.darkTheme ? <Icon name="sun" /> : <Icon name="moon" />}
                </Button>
                <Button positive onClick={onSave}>
                    {s("settingsBackButton")}
                </Button>
            </ViewHeading>
            <Sidebar as={Menu} inverted={settings.darkTheme} vertical visible width="thin">
                <div style={{ height: 62 }}></div>
                {sectionsMenuItems}
            </Sidebar>
            <Container fluid>
                <div style={{ paddingLeft: 150 }}>{sectionComponent}</div>
            </Container>
        </div>
    );
}
