import { useDispatch, useSelector } from "react-redux";
import { DropdownItemProps, Form, Header } from "semantic-ui-react";
import Platform from "../../../helpers/Platform";
import { TNotificationsMode, TSortPattern } from "../../../helpers/Settings";
import { settingsUpdate } from "../../../redux/actions/settingsActions";
import { TableScale } from "../../../redux/reducers/settingsReducer";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { s } from "../../../values/Strings";

const getSortPatterns: () => DropdownItemProps[] = () => [
    { key: 1, text: s("sortPatternWeight"), value: "default" },
    { key: 2, text: s("sortPatternAssigned"), value: "assignedto" },
    { key: 3, text: s("sortPatternId"), value: "id" },
];

const getNotificationsModes: () => DropdownItemProps[] = () => [
    { key: 1, text: s("notifModeAll"), value: "all" },
    { key: 2, text: s("notifModeMine"), value: "mine" },
    { key: 3, text: s("notifModeNone"), value: "none" },
];

const getTableScales: () => DropdownItemProps[] = () => [
    { key: 0, text: s("tableSizeSmall"), value: 0 },
    { key: 1, text: s("tableSizeMedium"), value: 1 },
    { key: 2, text: s("tableSizeLarge"), value: 2 },
];

const getRefreshRates: () => DropdownItemProps[] = () => [
    { key: 2, text: s("refresh3m"), value: 180 },
    { key: 3, text: s("refresh5m"), value: 300 },
    { key: 4, text: s("refresh10m"), value: 600 },
    { key: 5, text: s("refresh20m"), value: 1200 },
];

export function WorkItemsSection() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);

    const refreshRates = getRefreshRates();
    const tableScales = getTableScales();
    const notificationsModes = getNotificationsModes();
    const sortPatterns = getSortPatterns();

    if (Platform.current.isDev()) {
        if (refreshRates.length !== 5)
            refreshRates.push({
                key: Math.random(),
                text: s("refreshdebug"),
                value: 10,
            });
    }

    const toggleShowUnreads = () => {
        const showUnreads = !settings.showUnreads;
        dispatch(settingsUpdate({ showUnreads }));
    };

    const toggleIconColor = () => {
        const iconChangesOnMyWorkItemsOnly = !settings.iconChangesOnMyWorkItemsOnly;
        dispatch(settingsUpdate({ iconChangesOnMyWorkItemsOnly }));
    };

    const toggleMineOnTop = () => {
        const mineOnTop = !settings.mineOnTop;
        dispatch(settingsUpdate({ mineOnTop }));
    };

    const toggleIterationColors = () => {
        const enableIterationColors = !settings.enableIterationColors;
        dispatch(settingsUpdate({ enableIterationColors }));
    };

    const onTableScaleSelect = (val: TableScale) => {
        const tableScale = val;
        dispatch(settingsUpdate({ tableScale }));
    };

    const onRateSelect = (val: number) => {
        const refreshRate = val;
        dispatch(settingsUpdate({ refreshRate }));
    };

    const onSortSelect = (val: TSortPattern) => {
        const sortPattern = val;
        dispatch(settingsUpdate({ sortPattern }));
    };

    const onNotifModeSelect = (val: TNotificationsMode) => {
        const notificationsMode = val;
        dispatch(settingsUpdate({ notificationsMode }));
    };

    return (
        <>
            <Header as="h3" dividing>
                {s("settingsWIHeader")}
            </Header>
            <Form.Select
                label={s("ddRefreshLabel")}
                options={refreshRates}
                value={settings.refreshRate}
                onChange={(e, { value }) => onRateSelect(value as number)}
            />
            <br />
            <Form.Select
                label={s("sortPattern")}
                options={sortPatterns}
                value={settings.sortPattern}
                onChange={(e, { value }) => onSortSelect(value as TSortPattern)}
            />
            <br />
            <Form.Select
                label={s("ddShowNotifLabel")}
                options={notificationsModes}
                value={settings.notificationsMode}
                onChange={(e, { value }) => onNotifModeSelect(value as TNotificationsMode)}
            />
            <br />
            <Form.Checkbox
                label={s("cbIconLabel")}
                checked={settings.iconChangesOnMyWorkItemsOnly}
                onChange={toggleIconColor}
            />
            <br />
            <Form.Checkbox label={s("mineOnTop")} checked={settings.mineOnTop} onChange={toggleMineOnTop} />
            <br />
            {/* <Form.Checkbox label={s("showUnreads")} checked={settings.showUnreads} onChange={toggleShowUnreads} />
            <br /> //TODO: FL-11 */}
            <Form.Checkbox
                label={s("enableIterationColors")}
                checked={settings.enableIterationColors}
                onChange={toggleIterationColors}
            />
            <br />
            <Form.Select
                label={s("ddTableScale")}
                options={tableScales}
                value={settings.tableScale}
                onChange={(e, { value }) => onTableScaleSelect(value as TableScale)}
            />
            <br />
        </>
    );
}
