import { useCallback, useEffect, useState } from "react";
import { getApi } from "../api/client";
import { Timers } from "../helpers/Timers";
import { Project } from "../models/project";
import { PullRequest } from "../models/pull-request";
import { useSettingsStore } from "../zustand/settings";

const PR_TIMER_KEY = "pr-block-timer";
const fishWIs = !!import.meta.env.VITE_USE_FISH;

export function usePullRequestsLoader(
    accountId: string,
    projects: Project[],
    includeTeams: boolean,
    includeAcceptedByMePRs: boolean,
    includeHidden: boolean
) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [allPullRequests, setAllPullRequests] = useState<PullRequest[]>([]);
    const refreshRate = useSettingsStore((state) => state.refreshRate);

    const load = useCallback(async () => {
        console.log("updating PRs");
        try {
            const allPRs = fishWIs
                ? []
                : await getApi(accountId).pullRequest.getByProjects(projects.filter((p) => p.enabled));
            setAllPullRequests(allPRs);
            setErrorMessage(null);
        } catch (e: any) {
            setErrorMessage(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [projects]);

    const routineStart = useCallback(async () => {
        setIsLoading(true);

        Timers.delete(PR_TIMER_KEY);

        await load();

        Timers.create(PR_TIMER_KEY, 1000 * refreshRate, () => {
            setIsLoading(true);
            load();
        });
    }, [refreshRate, load]);

    useEffect(() => {
        routineStart();
        return () => {
            Timers.delete(PR_TIMER_KEY);
        };
    }, [routineStart, projects]);

    const pullRequests = allPullRequests
        .filter((x) => {
            if (x.isHidden()) return includeHidden;
            return true;
        })
        .filter((x) => {
            const belonging = x.getBelonging();

            if (!belonging) return false;
            if (belonging === "team") return includeTeams;
            return true;
        })
        .filter((x) => {
            if (includeAcceptedByMePRs) return true;
            return !x.isAcceptedByMe();
        });

    const hasTeams = allPullRequests.some((x) => x.getBelonging() === "team");
    const hasAcceptedByMe = allPullRequests.some((x) => x.isAcceptedByMe());
    const hasHidden = allPullRequests.some((x) => x.isHidden());

    return {
        isLoading,
        routineStart,
        pullRequests,
        errorMessage,
        hasTeams,
        hasAcceptedByMe,
        hasHidden,
        allPullRequests,
    };
}
