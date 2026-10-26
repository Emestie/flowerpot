## What is Flowerpot

Flowerpot is an electron app that working in background and tracking your Azure DevOps queries. Once an item was added or changed you will receive a desktop notification.

## Downloads

You can download latest version [here](https://github.com/Emestie/flowerpot/releases/latest).

## Connecting an Azure DevOps account

Flowerpot works with both **Azure DevOps Services** (cloud) and **Azure DevOps Server** (on-premises).

### 1. Get your account URL

| Environment | Valid URL format |
|---|---|
| Azure DevOps Services | `https://dev.azure.com/your-organization/` or `https://your-org.visualstudio.com/` (trailing slash optional) |
| Azure DevOps Server | `https://your-server:8080/tfs/` (must end with a slash) |

You can copy the URL from your browser — open Azure DevOps the same way you normally do, the part before the project name is your account URL.

### 2. Create a Personal Access Token (PAT)

1. In Azure DevOps open **User settings → Personal access tokens** (the app can also open this page for you from the account form).
2. Create a new token:
   - **Organization**: *All accessible organizations* (or the specific one you use).
   - **Expiration**: pick whatever suits you — you will need to re-enter the token after it expires.
   - **Scopes**: the app needs full access (work items, queries, pull requests, identity). When in doubt, choose *Full access*.
3. Copy the token — it is shown only once.

Detailed Microsoft documentation: [Use personal access tokens](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows).

### 3. Add the account in Flowerpot

1. Open **Settings → Accounts → Add account**.
2. Enter your account URL and paste the token.
3. Press **Validate and save** — Flowerpot checks the credentials, verifies the required permission scopes (`vso.project`, `vso.work`, `vso.code`, `vso.identity`) and saves the account.
4. Back in Settings, pick the **queries** and **projects** to track.

Flowerpot now polls the selected queries in the background and sends a desktop notification whenever a work item or pull request is added or changed. Repeat the steps to add more accounts (including a mix of cloud and on-premises ones).

## Changelog

Changelog (russian version only) can be accessed [here](https://emestie.github.io/flowerpot/changelog).
