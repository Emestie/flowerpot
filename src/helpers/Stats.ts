import { settingsUpdate } from "../redux/actions/settingsActions";
import { store } from "../redux/store";

export enum UsageStat {
    Test = "test",
    AppStarts = "appStarts", //done
    WorkItemsArrived = "workItemsArrived", //done
    NotificationsSent = "notificationsSent", //done
    NetworkFailures = "networkFailures", //done
    MinutesSpentInApp = "minutesSpentInApp", //done
    AppVersionsUpdated = "appVersionUpdated", //done
    WorkItemsOpened = "workItemsOpened", //done
    WorkItemsInfoCopied = "workItemsInfoCopied", //done
    UsersNamesCopied = "usersNamesCopied", //done
    WorkItemsAddedToLists = "workItemsAddedToLists", //done
    AccountVerifications = "accountVerifications", //done
}

export class Stats {
    public static increment(stat: UsageStat) {
        Stats.incrementBy(stat, 1);
    }

    public static incrementBy(stat: UsageStat, amount: number) {
        const { stats } = store.getState().settings;

        if (!stats[stat]) stats[stat] = 0;

        stats[stat] += amount;

        store.dispatch(settingsUpdate({ stats: { ...stats } }));
    }
}
