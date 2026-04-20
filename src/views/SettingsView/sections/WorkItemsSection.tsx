import { DropdownItemProps, Form, Header } from "semantic-ui-react";
import Platform, { PlatformType } from "../../../helpers/Platform";
import { TNotificationsMode, TSortPattern } from "../../../helpers/Settings";
import { TableScale } from "../../../zustand/settings";
import { s } from "../../../values/Strings";
import { useSettingsStore } from "../../../zustand/settings";

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
    { key: 1, text: s("refreshNever"), value: 999999 },
    { key: 2, text: s("refresh3m"), value: 180 },
    { key: 3, text: s("refresh5m"), value: 300 },
    { key: 4, text: s("refresh10m"), value: 600 },
    { key: 5, text: s("refresh20m"), value: 1200 },
];

export function WorkItemsSection() {
    const showUnreads = useSettingsStore((state) => state.showUnreads);
    const iconChangesOnMyWorkItemsOnly = useSettingsStore((state) => state.iconChangesOnMyWorkItemsOnly);
    const mineOnTop = useSettingsStore((state) => state.mineOnTop);
    const enableIterationColors = useSettingsStore((state) => state.enableIterationColors);
    const enableQueryColorCode = useSettingsStore((state) => state.enableQueryColorCode);
    const showEmptyQueries = useSettingsStore((state) => state.showEmptyQueries);
    const refreshRate = useSettingsStore((state) => state.refreshRate);
    const sortPattern = useSettingsStore((state) => state.sortPattern);
    const notificationsMode = useSettingsStore((state) => state.notificationsMode);
    const tableScale = useSettingsStore((state) => state.tableScale);
    const setShowUnreads = useSettingsStore((state) => state.setShowUnreads);
    const setIconChangesOnMyWorkItemsOnly = useSettingsStore((state) => state.setIconChangesOnMyWorkItemsOnly);
    const setMineOnTop = useSettingsStore((state) => state.setMineOnTop);
    const setEnableIterationColors = useSettingsStore((state) => state.setEnableIterationColors);
    const setEnableQueryColorCode = useSettingsStore((state) => state.setEnableQueryColorCode);
    const setShowEmptyQueries = useSettingsStore((state) => state.setShowEmptyQueries);
    const setTableScale = useSettingsStore((state) => state.setTableScale);
    const setRefreshRate = useSettingsStore((state) => state.setRefreshRate);
    const setSortPattern = useSettingsStore((state) => state.setSortPattern);
    const setNotificationsMode = useSettingsStore((state) => state.setNotificationsMode);

    const refreshRates = getRefreshRates();
    const tableScales = getTableScales();
    const notificationsModes = getNotificationsModes();
    const sortPatterns = getSortPatterns();

    if (Platform.current.isDev()) {
        if (refreshRates.length !== 6)
            refreshRates.push({
                key: Math.random(),
                text: s("refreshdebug"),
                value: 10,
            });
    }

    const toggleShowUnreads = () => {
        setShowUnreads(!showUnreads);
    };

    const toggleIconColor = () => {
        setIconChangesOnMyWorkItemsOnly(!iconChangesOnMyWorkItemsOnly);
    };

    const toggleMineOnTop = () => {
        setMineOnTop(!mineOnTop);
    };

    const toggleIterationColors = () => {
        setEnableIterationColors(!enableIterationColors);
    };

    const toggleQueryColorCode = () => {
        setEnableQueryColorCode(!enableQueryColorCode);
    };

    const toggleShowEmptyQueries = () => {
        setShowEmptyQueries(!showEmptyQueries);
    };

    const onTableScaleSelect = (val: TableScale) => {
        setTableScale(val);
    };

    const onRateSelect = (val: number) => {
        setRefreshRate(val);
    };

    const onSortSelect = (val: TSortPattern) => {
        setSortPattern(val);
    };

    const onNotifModeSelect = (val: TNotificationsMode) => {
        setNotificationsMode(val);
    };

    return (
        <>
            <Header as="h3" dividing>
                {s("settingsWIHeader")}
            </Header>
            <Form.Select
                label={s("ddRefreshLabel")}
                options={refreshRates}
                value={refreshRate}
                onChange={(e, { value }) => onRateSelect(value as number)}
            />
            <br />
            <Form.Select
                label={s("sortPattern")}
                options={sortPatterns}
                value={sortPattern}
                onChange={(e, { value }) => onSortSelect(value as TSortPattern)}
            />
            <br />
            {Platform.type === PlatformType.Electron && (
                <>
                    <Form.Select
                        label={s("ddShowNotifLabel")}
                        options={notificationsModes}
                        value={notificationsMode}
                        onChange={(e, { value }) => onNotifModeSelect(value as TNotificationsMode)}
                    />
                    <br />
                </>
            )}
            {Platform.type === PlatformType.Electron && (
                <>
                    <Form.Checkbox
                        label={s("cbIconLabel")}
                        checked={iconChangesOnMyWorkItemsOnly}
                        onChange={toggleIconColor}
                    />
                    <br />
                </>
            )}
            <Form.Checkbox label={s("mineOnTop")} checked={mineOnTop} onChange={toggleMineOnTop} />
            <br />
            <Form.Checkbox label={s("showUnreads")} checked={showUnreads} onChange={toggleShowUnreads} />
            <br />
            <Form.Checkbox
                label={s("enableIterationColors")}
                checked={enableIterationColors}
                onChange={toggleIterationColors}
            />
            <br />
            <Form.Checkbox
                label={s("enableQueryColorCode")}
                checked={enableQueryColorCode}
                onChange={toggleQueryColorCode}
            />
            <br />
            <Form.Checkbox
                label={s("showEmptyQueries")}
                checked={showEmptyQueries}
                onChange={toggleShowEmptyQueries}
            />
            <br />
            <Form.Select
                label={s("ddTableScale")}
                options={tableScales}
                value={tableScale}
                onChange={(e, { value }) => onTableScaleSelect(value as TableScale)}
            />
            <br />
        </>
    );
}
