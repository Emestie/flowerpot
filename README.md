<p align="center">
    <img src="src/assets/flower-256.png" width="96" height="96" alt="Flowerpot" />
</p>

<h1 align="center">Flowerpot</h1>

<p align="center">
    <b>Azure DevOps work items and pull requests, watched in the background.</b><br />
    Flowerpot refreshes the queries you choose, marks what changed, and tells you when something needs attention.
</p>

<p align="center">
    <a href="https://github.com/Emestie/flowerpot/releases/latest">Download</a> ·
    <a href="https://flowerpot-pwa.web.app">Web version</a> ·
    <a href="https://github.com/Emestie/flowerpot/issues">Issues</a>
</p>

Flowerpot is a small app that keeps an eye on Azure DevOps for you. Connect it with a Personal Access Token,
pick the queries and projects you care about, and it will poll them on a timer in the background. New and
changed work items and pull requests appear on one screen and in a desktop notification, and a colour-coded
tray icon tells you whether anything is waiting — so you do not need a pinned browser tab to stay in the loop.

It works with both **Azure DevOps Services** (cloud) and **Azure DevOps Server** (on-premises, including TFS
collections), and is available as a desktop app and as an installable PWA.

## Ways to run it

|                                | Desktop app                                                    | Web / PWA                                                       |
| ------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------- |
| Platforms                      | Windows 10/11 (x64), macOS (Apple Silicon)                      | any modern browser, installable on desktop and mobile           |
| Tray / menu bar icon           | yes                                                             | —                                                               |
| Notifications                  | native OS notifications                                         | browser notifications (permission required)                     |
| Start with the OS              | Windows only, optional                                          | —                                                               |
| Keeps running in the tray      | yes on Windows; closing the window does not quit                | browser tab / installed app stays open                          |
| Updates                        | automatic on Windows, manual download on macOS                  | always the latest build after a reload                          |
| Settings storage               | `settings.json` in the app data folder                          | `localStorage` of the browser                                   |
| Azure DevOps Services / Server | yes / yes                                                       | yes / yes                                                       |

## Download

Grab the latest build from the [releases page](https://github.com/Emestie/flowerpot/releases/latest):

- **Windows** — `Flowerpot-Setup-<version>.exe`. A normal NSIS installer; later versions download and install
  themselves through the app.
- **macOS** — `Flowerpot-<version>-arm64.dmg` (Apple Silicon). The build is not notarized, so macOS may block
  the first launch: **right-click → Open** (or *System Settings → Privacy & Security → Open Anyway*). Updates
  are installed manually: the app detects a new release and opens the releases page for you.
- **Web** — open [flowerpot-pwa.web.app](https://flowerpot-pwa.web.app) and use the browser's *Install app*
  action if you want a standalone window or a home screen icon.
- **Linux** — there is no official build at the moment.

## Connecting an Azure DevOps account

### 1. Get your account URL

| Environment           | Valid URL format                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| Azure DevOps Services | `https://dev.azure.com/your-organization/` or `https://your-organization.visualstudio.com/`      |
| Azure DevOps Server   | `https://your-server:8080/tfs/` (must end with a slash)                                         |

You can copy the URL from your browser — open Azure DevOps the way you normally do, the part before the
project name is your account URL. Cloud accounts are stored in the canonical
`https://your-organization.visualstudio.com/` form, so the trailing slash is optional there.

### 2. Create a Personal Access Token (PAT)

1. In Azure DevOps open **User settings → Personal access tokens** (the account form in Flowerpot can also
   open this page for you).
2. Create a new token:
    - **Organization**: *All accessible organizations* (or the specific one you use).
    - **Expiration**: pick whatever suits you — you will have to re-enter the token after it expires.
    - **Scopes**: the app works with the maximum access level. When in doubt, choose **Full access**.
3. Copy the token — it is shown only once.

Detailed Microsoft documentation:
[Use personal access tokens](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows).

### 3. Add the account in Flowerpot

1. Open **Settings → Accounts → Add account**.
2. Enter your account URL and paste the token.
3. Press **Validate and save**. Flowerpot checks the credentials, verifies that the token can reach
   `vso.project`, `vso.work`, `vso.code` and `vso.identity`, and refuses to save an account without them.
4. Repeat for other accounts if needed. Up to **5 accounts** are supported, and you can mix cloud and
   on-premises ones; each account gets its own flower badge.

The token and settings stay on your machine. Flowerpot only sends the token to your Azure DevOps server, in
the `Authorization` header of its API requests.

### 4. Choose what to watch

- **Queries** — **Settings → Queries → Add query**. The picker lists queries from your projects two hierarchy
  levels deep; shared queries are hidden until you enable **Show shared queries**. You can also paste a query
  link with **Add by URL**. Reorder the blocks with the arrows, disable a query, or keep it out of
  notifications or the tray icon (desktop).
- **Projects** — **Settings → Projects and Pull Requests → Add project** adds the projects whose pull requests
  should be tracked. A **Pull requests** block then appears on the main screen for that account.

## What it does

### Work items

- **One block per watched query**, with a live counter for all items and for priority 1 items, a hidden
  counter, a green check when the query is empty, and a red cross when it fails to load.
- **Per-query filters** by work item type and status, straight from the block header; the choice is remembered.
- **Sorting**: priority + date (default), assigned to + date, ID, or the original query order. Pinned items
  always stay on top and deferred items at the bottom.
- **Read/unread marks**: new and changed items stay marked until you click them or press *mark all as read*.
- **Show only mine** in the toolbar, plus an option to keep your items on top in every block.
- **Quick search** in the toolbar filters the loaded items by several terms separated with `;` — title, ID,
  assignee, creator, iteration path, state and tags.
- **Open by ID** opens any work item in Azure DevOps by its number, even if it is not part of a watched query.
- **Colour coding** for iteration paths and query headers, if you like your lists colourful.
- **Inline status changes**: click a status in the grid to pick another state; the change is written back to
  Azure DevOps immediately.
- **Local notes**: attach a coloured note to a work item. Notes never leave your machine.
- **Per-block refresh**, collapse/expand all, and an *open in browser* link for the query itself.

### Lists

Right-click a work item (or use the card on mobile) to move it between lists. The same item can only be in
one list at a time: adding it to another list removes it from the previous one.

| List           | What it does                                                                  |
| -------------- | ----------------------------------------------------------------------------- |
| **Pinned**     | keeps the item on top of its query block                                      |
| **Favorites**  | marks the item with a star                                                    |
| **Forwarded**  | marks the item with an arrow                                                  |
| **Deferred**   | pushes the item to the bottom of the block                                    |
| **Hidden**     | hides the item until it changes                                               |
| **Permawatch** | collects items into a dedicated block that stays until you remove them        |
| **Keywords**   | highlights items containing the keyword in blue                               |

The same context menu copies the summary, ID or URL and edits the local note; the item title is a link to
Azure DevOps.

### Pull requests

- A **Pull requests** block per account and a filter for every grouping you might need: **team** pull
  requests, **accepted by me**, **drafts**, and **hidden** ones.
- Each row shows the ID, project/repository, source → target branch, tags, title, resolved/total comment
  count, reviewers (required reviewers are highlighted), author and age; drafts and merge conflicts get a
  label.
- **Hide** a pull request locally without touching anything in Azure DevOps, and unhide it from the same
  menu.
- Optional notifications for new and changed pull requests, switched on separately from work item
  notifications.

### Notifications and the tray icon

- Desktop notifications for new and changed work items in three modes: **all**, **mine only**, or **off**.
  When several items change at once the app sends one summary notification instead of a burst.
- In the web version, grant notification permission once via **Settings → Notifications**.
- The tray icon (menu bar on macOS) is a one-glance summary, computed from the enabled queries that are not
  marked *Ignore icon*:
    - **grey** — no data yet (still loading, or no connection);
    - **red** — a priority 1 item is waiting;
    - **yellow** — there are items in the watched queries;
    - **green** — nothing to do.
- On Windows, Flowerpot can start with the system and keeps running in the tray after the window is closed;
  the tray menu shows or quits the app.

### Accounts and languages

- Several accounts can be connected at once. When more than one is set up, every block carries the account's
  flower badge.
- Interface languages: **English**, **Russian**, and **Belarusian**, selected in **Settings → Other**.
- Release notes are translated as well and are available inside the app.

## Settings reference

| Section                       | What is there                                                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Accounts**                  | Add, edit, re-validate and remove accounts (up to 5); each account gets its own flower badge                          |
| **Queries**                   | Enable/disable, reorder, remove, *Ignore Icon* / *Ignore Notif.* per query, add queries                               |
| **Projects and Pull Requests** | Projects whose pull requests are tracked                                                                             |
| **Lists**                     | Manage Permawatch, Keywords, Hidden, Favorites, Forwarded, Pinned and Deferred entries                                 |
| **Quick links**               | Up to 20 named, coloured shortcuts shown under the main heading                                                       |
| **Appearance**                | Theme (light / dark / system), colour scheme (Classic / Flexoki / Shire), table font size, iteration and query colour coding, refresh interval (3, 5, 10, 20 minutes or never), sort pattern, unread marks, empty queries, mine on top |
| **Notifications**             | Work item notification mode, pull request notifications, browser permission request (web)                             |
| **Transfer settings**         | Export the current settings as a text string or import them into another installation                                 |
| **Other**                     | Language, start with Windows, update status, feedback, release notes, link to the web version                        |

> The exported settings string contains your Personal Access Tokens. Treat it like a password and do not
> paste it anywhere public.

## Data and privacy

- Account credentials, settings, lists, notes and layout preferences are stored **locally** — in
  `settings.json` in the app data folder on desktop, and in `localStorage` in the browser version.
- Flowerpot talks to your Azure DevOps server, to GitHub for update checks and release downloads, and to a
  small feedback endpoint when you send feedback.

## Troubleshooting

- **“Server unavailable or the Personal Access Token is incorrect or expired.”** Create a new PAT with the
  maximum access level, open the account in **Settings → Accounts**, paste it and validate again.
- **The account URL is rejected.** It must start with `http://` or `https://`. On-premises URLs must end with
  `/` (usually `/tfs/`); cloud URLs may use either `dev.azure.com` or `visualstudio.com`, with or without the
  trailing slash.
- **No notifications.** Check the OS notification settings for Flowerpot, and that notifications are not set
  to *Off*. In the web version, use **Settings → Notifications → Request notification permission** and allow
  notifications in the browser.
- **macOS refuses to open the app.** The build is unsigned; right-click the app and choose **Open** once, or
  allow it in *System Settings → Privacy & Security*.
- **A settings problem banner appears.** Flowerpot could not read or write `settings.json`. The banner names
  the case; a damaged file is kept as `settings.corrupt-<timestamp>.json` next to the original, and the app
  can show you the folder. If the file could not be read at all, the app runs read-only until you restart it.

## Release notes

Starting with 1.0 (*Aglaonema*), every minor release is named after a plant, and patch releases keep their
plant. The bundled changelog is available in the app under **Settings → Other → Release notes**, with a link
to older versions. If you prefer the repository versions, the current notes live in
[`public/info-pages`](public/info-pages) as `changelog.en.md`, `changelog.ru.md` and `changelog.be.md`.

## License

Flowerpot is released under the MIT license.
