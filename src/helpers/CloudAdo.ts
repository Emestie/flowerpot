/**
 * Helpers around Microsoft-hosted Azure DevOps Services URLs.
 *
 * ADO Services orgs live at https://{org}.visualstudio.com/ (or the legacy
 * https://dev.azure.com/{org}/ entry point) and have no collection path
 * segment, unlike on-prem Azure DevOps Server (https://tfs:8080/tfs/Collection/).
 */

const VISUAL_STUDIO_SUFFIX = ".visualstudio.com";
const DEV_AZURE_HOST = "dev.azure.com";

export default class CloudAdo {
    /**
     * Returns the organization name for a cloud URL ("mstpwnz" for
     * https://mstpwnz.visualstudio.com/ and https://dev.azure.com/mstpwnz/...),
     * or an empty string for on-premises URLs.
     */
    public static getOrgName(url: string): string {
        try {
            const parsed = new URL(url);
            const host = parsed.host.toLowerCase();

            if (host === DEV_AZURE_HOST) {
                return parsed.pathname.split("/").filter(Boolean)[0] || "";
            }

            if (host.endsWith(VISUAL_STUDIO_SUFFIX)) {
                //strip "{org}" from "{org}.visualstudio.com", also handling the
                //"{org}.vssps.visualstudio.com" service host
                return host.slice(0, -VISUAL_STUDIO_SUFFIX.length).replace(/\.vssps$/, "");
            }

            return "";
        } catch {
            return "";
        }
    }

    public static isCloudUrl(url: string): boolean {
        return !!this.getOrgName(url);
    }

    /**
     * Converts a cloud URL to the canonical https://{org}.visualstudio.com/
     * form: Azure DevOps always emits this host in payload hrefs, so the
     * stored account URL must match. On-premises URLs are returned as-is.
     */
    public static canonicalizeUrl(url: string): string {
        const org = this.getOrgName(url);

        if (!org) return url;

        return "https://" + org + VISUAL_STUDIO_SUFFIX + "/";
    }

    /**
     * The service host where the identities API lives: on ADO Services
     * _apis/identities does not exist on the org host, only on
     * https://{org}.vssps.visualstudio.com/.
     */
    public static getVsspsUrl(url: string): string {
        const org = this.getOrgName(url);

        if (!org) return url;

        return "https://" + org + ".vssps" + VISUAL_STUDIO_SUFFIX + "/";
    }

    /**
     * Display name for a collection: on-premises accounts have a real
     * collection name, cloud accounts use an empty one — the org name is
     * the closest human-readable equivalent.
     */
    public static getCollectionDisplayName(accountUrl: string | undefined, collectionName: string | undefined) {
        if (collectionName) return collectionName;

        if (accountUrl) {
            const org = this.getOrgName(accountUrl);
            if (org) return org;
        }

        return "";
    }
}
