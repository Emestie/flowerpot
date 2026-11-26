/**
 * Pure compatibility-mode policy, kept free of Electron imports so it can be
 * tested directly. See compat-mode.ts for how the record is stored.
 */
export interface ICompatModeRecord {
    enabled: boolean;
    /** App version that could not start with the sandbox. */
    version: string;
    /** `os.release()` at the time, so a Windows update gets a fresh attempt. */
    osRelease: string;
    enabledAt: number;
    reason?: string;
    exitCode?: number;
}

/** The sandbox failure this works around is specific to Windows. */
export function isCompatModeSupportedOn(platform: NodeJS.Platform) {
    return platform === "win32";
}

/** The failure was on this exact app version and Windows build. */
export function compatRecordMatches(record: ICompatModeRecord, version: string, osRelease: string) {
    return record.version === version && record.osRelease === osRelease;
}

export function isCompatRecordActive(record: ICompatModeRecord | null, version: string, osRelease: string) {
    return !!record && record.enabled && compatRecordMatches(record, version, osRelease);
}
