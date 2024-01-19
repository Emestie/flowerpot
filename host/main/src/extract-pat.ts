import { app } from "electron";
import { readFileSync } from "fs";
import { join } from "path";

export async function extractNpmrcPat(): Promise<string | null> {
    const homeFolderPath = app.getPath("home");
    const npmrcFilePath = join(homeFolderPath, ".npmrc");

    try {
        const npmrcFile = readFileSync(npmrcFilePath).toString().replaceAll(/\r/g, "");
        const [_, withRegistryUrl] = npmrcFile.split("@eos:registry=");
        const [registryUrl] = withRegistryUrl.split("\n");
        const [__, registryWithNoProtocol] = registryUrl.split("//");
        const [___, withPasswordWithQuotes] = npmrcFile.split(registryWithNoProtocol + ":_password=");
        const [passwordWithQuotes] = withPasswordWithQuotes.split("\n");
        const passwordWithNoQuotes = passwordWithQuotes.replaceAll('"', "");
        const token = atob(passwordWithNoQuotes);

        return token;
    } catch (e) {
        return null;
    }
}
