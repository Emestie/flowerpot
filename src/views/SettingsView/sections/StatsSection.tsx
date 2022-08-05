import { useSelector } from "react-redux";
import { Header, List } from "semantic-ui-react";
import { UsageStat } from "../../../helpers/Stats";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { s } from "../../../values/Strings";

export function StatsSection() {
    const { stats } = useSelector(settingsSelector);

    const statItems = Object.values(UsageStat)
        .filter((statName) => statName !== UsageStat.Test)
        .map((statName) => {
            return {
                statDisplayName: s(`statDisplayName_${statName}`),
                jsx: (
                    <List.Item>
                        <List.Content>
                            {s(`statDisplayName_${statName}`)}: <b>{stats[statName as UsageStat] || 0}</b>
                        </List.Content>
                    </List.Item>
                ),
            };
        })
        .sort((a, b) => (a.statDisplayName < b.statDisplayName ? -1 : 1));

    return (
        <>
            <Header as="h3" dividing>
                {s("statsSettingsHeader")}
            </Header>
            <List divided>{statItems.map((x) => x.jsx)}</List>
        </>
    );
}
