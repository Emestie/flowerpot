import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loaders from "../helpers/Loaders";
import { IProject } from "../helpers/Project";
import { IPullRequest } from "../helpers/PullRequest";
import { Timers } from "../helpers/Timers";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

const PR_TIMER_KEY = "pr-block-timer";
const useFishWIs = !!import.meta.env.VITE_USE_FISH;

export function usePullRequestsLoader(projects: IProject[]) {
    const [isLoading, setIsLoading] = useState(true);
    const [pullRequests, setPullRequests] = useState<IPullRequest[]>([]);
    const { refreshRate, tfsUser } = useSelector(settingsSelector);

    const load = useCallback(async () => {
        console.log("updating PRs");

        const prs = useFishWIs ? [] : await Loaders.loadPullRequests(projects.filter((p) => p.enabled));

        const filteredPRs = prs.filter((x) => {
            if (x.isDraft) return false;

            const lowerAuthor = x.authorUid.toLowerCase();
            const lowerReviewers = x.reviewers.map((z) => z.uid.toLowerCase());

            if ([lowerAuthor, ...lowerReviewers].includes(tfsUser.toLowerCase())) {
                return true;
            }

            return false;
        });

        setPullRequests(filteredPRs);
        setIsLoading(false);
    }, [projects, tfsUser]);

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

    return { isLoading, routineStart, pullRequests };
}
