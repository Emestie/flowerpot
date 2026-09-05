import { useCallback, useEffect, useRef, useState } from "react";
import { getApi } from "../api/client";
import Differences from "../helpers/Differences";
import { Timers } from "../helpers/Timers";
import { Project } from "../models/project";
import { PullRequest } from "../models/pull-request";
import { useSettingsStore } from "../zustand/settings";

const PR_TIMER_KEY_PREFIX = "pr-block-timer-";
const fishWIs = !!import.meta.env.VITE_USE_FISH;

export function usePullRequestsLoader(
    accountId: string,
    projects: Project[],
    includeTeams: boolean,
    includeAcceptedByMePRs: boolean,
    includeHidden: boolean,
    includeDrafts: boolean
) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [allPullRequests, setAllPullRequests] = useState<PullRequest[]>([]);
    const refreshRate = useSettingsStore((state) => state.refreshRate);

    const loadIdRef = useRef(0);

    const load = useCallback(async () => {
        const loadId = ++loadIdRef.current;
        console.log("updating PRs");
        try {
            const allPRs = fishWIs
                ? []
                : await getApi(accountId).pullRequest.getByProjects(projects.filter((p) => p.enabled));
            if (loadId !== loadIdRef.current) return;
            setAllPullRequests(allPRs);
            Differences.putPRs(accountId, allPRs);
            setErrorMessage(null);
        } catch (e: any) {
            if (loadId !== loadIdRef.current) return;
            setErrorMessage(e.message);
        } finally {
            if (loadId === loadIdRef.current) setIsLoading(false);
        }
    }, [projects, accountId]);

    const timerKey = `${PR_TIMER_KEY_PREFIX}${accountId}`;

    const routineStart = useCallback(async () => {
        setIsLoading(true);

        Timers.delete(timerKey);

        await load();

        Timers.create(timerKey, 1000 * refreshRate, () => {
            setIsLoading(true);
            load();
        });
    }, [refreshRate, load, timerKey]);

    useEffect(() => {
        routineStart();
        return () => {
            Timers.delete(timerKey);
        };
    }, [routineStart, projects, timerKey]);

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
        })
        .filter((x) => {
            if (x.isDraft) return includeDrafts;
            return true;
        });

    const hasTeams = allPullRequests.some((x) => x.getBelonging() === "team");
    const hasAcceptedByMe = allPullRequests.some((x) => x.isAcceptedByMe());
    const hasHidden = allPullRequests.some((x) => x.isHidden());
    const hasDraft = allPullRequests.some((x) => x.isDraft);

    return {
        isLoading,
        routineStart,
        pullRequests,
        errorMessage,
        hasTeams,
        hasAcceptedByMe,
        hasHidden,
        hasDraft,
        allPullRequests,
    };
}
