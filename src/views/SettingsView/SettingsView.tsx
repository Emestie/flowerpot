import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Icon, Menu, Sidebar } from "semantic-ui-react";
import { LocalVersionBanner } from "../../components/LocalVersionBanner";
import { ViewHeading } from "../../components/heading/ViewHeading";
import { appViewSet } from "../../redux/actions/appActions";
import { settingsUpdate } from "../../redux/actions/settingsActions";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { AccountSection } from "./sections/AccountSection";
import { CreditsSection } from "./sections/CreditsSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { QueriesSection } from "./sections/QueriesSection";
import { QuickLinksSections } from "./sections/QuickLinksSections";
import { StatsSection } from "./sections/StatsSection";
import { WorkItemsSection } from "./sections/WorkItemsSection";
import { Sections } from "/@/redux/reducers/settingsReducer";

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

    const { settingsSection, darkTheme } = useSelector(settingsSelector);

    const toggleTheme = () => {
        const darkTheme_ = !darkTheme;
        dispatch(settingsUpdate({ darkTheme: darkTheme_ }));
    };

    const onSave = () => {
        dispatch(appViewSet("main"));
    };

    const sectionsMenuItems = sectionsList.map((section, i) => (
        <Menu.Item
            key={i}
            as="a"
            active={section.id === settingsSection}
            onClick={() => dispatch(settingsUpdate({ settingsSection: section.id }))}
        >
            {s(section.captionKey as any)}
        </Menu.Item>
    ));

    const sectionComponent = getSectionComponent(settingsSection);

    return (
        <div className="Page">
            <ViewHeading>
                <LocalVersionBanner />
                <Button icon onClick={toggleTheme}>
                    {darkTheme ? <Icon name="sun" /> : <Icon name="moon" />}
                </Button>
                <Button positive onClick={onSave}>
                    {s("settingsBackButton")}
                </Button>
            </ViewHeading>
            <Sidebar as={Menu} inverted={darkTheme} vertical visible width="thin">
                <div style={{ height: 62 }}></div>
                {sectionsMenuItems}
            </Sidebar>
            <Container fluid>
                <div style={{ paddingLeft: 150 }}>{sectionComponent}</div>
            </Container>
        </div>
    );
}
