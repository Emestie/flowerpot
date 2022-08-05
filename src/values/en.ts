import { ILocalizedStrings } from "./Strings";

const en: ILocalizedStrings = {
    //settings view
    refresh1m: "1 minute",
    refresh3m: "3 minutes",
    refresh5m: "5 minutes",
    refresh10m: "10 minutes",
    refreshdebug: "(debug) 10 seconds",
    sortPatternWeight: "Weight, Date",
    sortPatternAssigned: '"Assigned To", Date',
    sortPatternId: "ID",
    notifModeAll: "All",
    notifModeMine: "Mine only",
    notifModeNone: "None",
    localeAuto: "Auto",
    localeEn: "English",
    localeRu: "Russian",
    updateStateChecking: "Checking for updates...",
    updateStateDownloading: "Downloading update...",
    updateStateReady: "Update ready. Click to install",
    updateStateNone: "Check for updates",
    updateStateError: "Update error. Click to try again",
    settingsHeader: "Settings",
    editTfsSettingsBtn: "Manage TFS & Account settings",
    settingsBackButton: "OK",
    settingsQueriesHeader: "Queries to watch",
    settingsOthersHeader: "Others",
    ddLocalesLabel: "Language: ",
    ddRefreshLabel: "Queries refresh rate: ",
    ddShowNotifLabel: "Show notifications: ",
    cbIconLabel: "Change app icon color only on my Work Items events",
    cbAutostartLabel: "Start with Windows (applies on app restart)",
    settingsCreditsHeader: "Credits",
    versionWord: "Version",
    accountSettingsHeader: "Account",
    customListsSettingsHeader: "Custom Lists",
    quickLinksSettingsHeader: "Quick Links",
    //sel queries view
    loading: "Loading...",
    noQueriesAvailable: "You don't have any available queries. Make sure you added desired ones to Favorites in TFS.",
    selQHeader: "Select Queries",
    cancel: "Cancel",
    add: "Add",
    note: "NOTE!",
    selqNote1: "You can see here only queries that ",
    selqNote2: "",
    selqNote3: "",
    selqNote4: "not yet added",
    selqNote5: " to watch list.",
    selqAvailableHeader: "Available queries",
    refresh: "Refresh",
    //main view
    noQueriesToWatch: "No queries to watch",
    noQueriesToWatchText: "Go to settings and add some",
    mainHeader: "Queries",
    settings: "Settings",
    updateArrived: "Update arrived!",
    updateArrivedText1: "Flowerpot update is available. You can",
    updateArrivedText2: "it now by restarting the app.",
    install: "Install",
    //error view
    errorHeader: "Error :(",
    errorMsg: "Something bad happened!",
    errorDesc1: "You can try manually",
    errorDesc2: "page",
    errorDesc3: "Or go to",
    errorDesc4: "to check your account and server",
    tfsSettings: "TFS Settings",
    //creds view
    validate: "Validate and save",
    status: "Status: ",
    credsNoteText: "You must validate credentials you entered before leaving this page.",
    tfsPwd: "TFS password",
    tfsUser: "TFS username (with domain)",
    tfsPath: "TFS path (must start with 'http://' and end with '/')",
    credsHeader: "Credentials",
    save: "OK",
    tfsHeader: "TFS & Account settings",
    credsState1: "Not validated yet",
    credsState2: "Validating...",
    credsState3: "Server unavailable or TFS path is wrong",
    credsState4: "Incorrect Username or Password",
    credsState5: "OK",
    //helpers
    throwNoTeams: "No available team projects found",
    throwQueryLoading: "Error while loading query",
    throwAuth: "Cannot authenticate with provided credentials, TFS path is not valid or network problems occured",
    throwUnknown: "Something went wrong during request processing",
    notifNewItem: ": new item",
    notifChangedItem: ": item changed",
    //comps
    timeSinceCreated: "Time since created",
    revision: "Revision",
    priority: "Priority ",
    severity: "Severity ",
    addQuery: "Add query",
    actions: "Actions",
    ignoreNotif: "Ignore Notif.",
    ignoreIcon: "Ignore Icon",
    queryName: "Query name",
    teamProject: "Team project",
    sortPattern: "Work Items sort pattern: ",
    //lists
    manageLists: "Manage custom lists",
    mineOnTop: "Show my Work Items on top",
    settingsWIHeader: "Work Items",
    listsHeader: "Lists",
    favoritesDescription: "IDs of Work Items you will see marked with a star.",
    favorites: "Favorites",
    pinnedDescription: "IDs of Work Items you will see on top of query results.",
    pinned: "Pinned",
    deferredDescription: "IDs of Work Items you will see at the bottom of query results.",
    deferred: "Deferred",
    hiddenDescription:
        "IDs of Work Items that will be hidden from result list until something will be changed in them.",
    hidden: "Hidden",
    permawatchDescription:
        "IDs of Work Items that will be placed in separated query and stay there until manual remove.",
    permawatch: "Permawatch",
    keywords: "Keywords",
    keywordsDescription: "Work Items that contain keywords will be selected with blue.",
    listsNote:
        "Same item cannot be in several lists. If you add in list item that already in another list -- it will be removed from previous one.",
    addItemsInListNotice: "To add items in this list use context menu in Queries view.",
    //context
    copy: "Copy info",
    copyId: "Copy ID",
    removeFromList: "Remove from ",
    addToP: "Add to permawatch",
    addToF: "Add to favorites",
    addToD: "Add to deferred",
    addToH: "Hide until changes",
    addToPinned: "Pin",
    openExternal: "Open in browser",

    noteCommand: "Edit local note",
    noteDialog: "Local note for work item",

    hasShelve: "This item has a shelve",

    noAscii: "We're sorry, but for now only ASCII characters are supported in password.",
    cbTelemetry: "Allow usage stats collection",
    releaseNotes: "Release notes",

    localCaption: "Local version",
    localWarning:
        "App loaded with local scripts. The reason might be in the internet outage. Not all features available.",

    justUpdatedMessage1: "Flowerpot has been updated to version ",
    justUpdatedMessage2: "Release notes",
    justUpdatedHide: "Hide",
    justUpdatedNeverShow: "Never show this again",

    cbWhatsNew: "Show release notes after app update",

    listsClearAll: "Clear all",

    itemIsDone: "Done by ",
    done: "Done",

    localNoteHint: "Local note made by you",
    globalNoteHint: "Global note made by ",

    openById: "Open by ID",
    openByIdText: "Enter Work Item ID to open",

    showUnreads: "Mark new work items",
    markAllAsRead: "Mark all new items as read",

    contributors: "Fellow contributors: ",
    keyword: "Keyword",

    itemsWasChanged: " work items was changed",
    itemsNew: " new work items",

    moveToProd: "Move request",

    collection: "Collection",

    showAvatars: "Show avatars",

    flowerbot: "Set up Flowerbot",

    flowerbotBanner1: "Meet Flowerbot - a Telegram bot to catch your bugs and tasks.",
    flowerbotBanner2: "Give it a try.",

    quicksearch: "Quick Search",

    TenYearsAnny: "10 years of MR",

    feedbackAlert: "Flowerpot needs your feedback!",
    feedbackAlertButton: "Предложить идею",
    feedbackSettingsButton: "Feedback & Ideas",
    feedbackWindowCaption: "Enter your idea, feedback or bug report and press OK",

    //quicklinks
    addLink: "Add quick link",
    linkName: "Display name",
    linkUrl: "URL",
    linkColor: "Color",
    linkDialogCaption: "Add link to Quick Links area",
    linkDialogNameLabel: "Link display name",
    linkDialogUrlLabel: "URL",
    wrongCaptionOrUrl: "Name or URL is incorrect",
    noLinks: "add Quick Links here...",
    cbQuickLinksLabel: "Show Quick Links on Main page",

    enterID: "Enter ID of Work Item to open",

    apploading: "App and data is loading...",

    settingsActionsHeader: "Actions",

    hideBanner: "Hide",

    installUpdate: "Install update",

    wiStatus: "Status: ",
    linksLimitReached: "You have reached maximum amount of Quick Links",

    infoHeader: "Information",
    fetchingInfoPageContent: "Fetching info page content...",

    rocketBanner1: "Say hello to Rocket - a new Solution Launcher tool!",
    rocketBanner2: "Try Rocket",

    ddTableScale: "Work Items table font size: ",
    tableSizeSmall: "Small",
    tableSizeMedium: "Medium",
    tableSizeLarge: "Large",

    newItem: "New or updated Work Item",

    selpAvailableHeader: "Available projects",
    noProjectsAvailable: "No projects available",
    selPHeader: "Select Projects",

    addProject: "Add project",
    projectName: "Project name",
    projectsTableSettingsHeader: "Projects to watch Pull Requests",

    sectionAccount: "Account and Credentials",
    sectionQueries: "Queries and Lists",
    sectionWI: "Work Items",
    sectionProjects: "Projects and Pull Requests",
    sectionQL: "Quick Links",
    sectionCredits: "Other settings",

    pullRequestsBlockCaption: "Pull Requests",

    settingsAccountChecked: "Validated",
    settingsAccountNotChecked: "Not validated",

    showMineOnly: "Show mine Work Items only",

    statsSettingsHeader: "App Usage Stats",
    sectionStats: "Stats",
    statDisplayName_appStarts: "App starts",
    statDisplayName_workItemsArrived: "Work Items arrived",
    statDisplayName_notificationsSent: "Notifications sent",
    statDisplayName_networkFailures: "Network failures",
    statDisplayName_minutesSpentInApp: "Minutes spent",
    statDisplayName_appVersionUpdated: "App updates",
    statDisplayName_workItemsOpened: "Work Items opened",
    statDisplayName_workItemsInfoCopied: "Infoes copied",
    statDisplayName_usersNamesCopied: "Names copied",
    statDisplayName_workItemsAddedToLists: "Work Items added to lists",
    statDisplayName_accountVerifications: "Account verifications",
};

export default en;
