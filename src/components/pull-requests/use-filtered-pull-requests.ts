import { useHighlights } from "../../hooks/useHighlights";
import { PullRequest } from "../../models/pull-request";

export function useFilteredPullRequests(pullRequests: PullRequest[]) {
    const highlights = useHighlights();

    if (!highlights.length) {
        return pullRequests;
    }

    const prepare = (s: string | null | undefined): string => (s ?? "").toLowerCase();
    const indexOf = (s: string) => highlights.some((x) => s.includes(x));

    return pullRequests.filter((pr) => {
        const byId = indexOf(prepare(pr.id.toString()));
        const byTitle = indexOf(prepare(pr.title));
        const byAuthor = indexOf(prepare(pr.authorName)) || indexOf(prepare(pr.authorFullName));

        return byId || byTitle || byAuthor;
    });
}
