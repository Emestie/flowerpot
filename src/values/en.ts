const en = {
    //settings view
    refreshNever: "Never",
    refresh3m: "3 minutes",
    refresh5m: "5 minutes",
    refresh10m: "10 minutes",
    refresh20m: "20 minutes",
    refreshdebug: "(debug) 10 seconds",
    sortPatternWeight: "Priority, Date",
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
    updateStateReady: "Update is ready to install. Click to start",
    updateStateNone: "Check for updates",
    updateStateError: "Error while updating. Click to try again",
    settingsHeader: "Settings",
    editTfsSettingsBtn: "Account settings",
    settingsBackButton: "OK",
    settingsQueriesHeader: "Queries to watch",
    settingsOthersHeader: "Others",
    ddLocalesLabel: "Language: ",
    ddRefreshLabel: "Automatic queries refresh interval: ",
    ddShowNotifLabel: "Show notifications: ",
    cbIconLabel: "Change app icon only for events related to my work items",
    cbAutostartLabel: "Start with Windows (applies on app restart)",
    settingsCreditsHeader: "Credits",
    versionWord: "Version",
    accountSettingsHeader: "Accounts",
    customListsSettingsHeader: "Lists",
    quickLinksSettingsHeader: "Quick Links",
    //sel queries view
    loading: "Loading...",
    noQueriesAvailable:
        "No queries available to you. Make sure you added the desired ones to Favorites in TFS/Azure DevOps.",
    selQHeader: "Select Queries",
    cancel: "Cancel",
    add: "Add",
    note: "Important!",
    selqNote1:
        "For technical reasons, only queries at the first and second hierarchy levels are available for selection",
    selqAvailableHeader: "Available queries",
    refresh: "Refresh",
    //main view
    noAccountsSetup: "No accounts setup",
    noAccountsSetupText: "Add them in settings",
    noQueriesToWatch: "No queries to watch",
    noQueriesToWatchText: "Add them in settings",
    settings: "Settings",
    updateArrived: "Update arrived!",
    updateArrivedText1: "Flowerpot update is ready. ",
    updateArrivedText2: "Install it by clicking the button or restarting the app.",
    install: "Install",
    //error view
    errorHeader: "Error :(",
    errorMsg: "Something bad happened!",
    errorDesc1: "You can manually",
    errorDesc2: "refresh the page",
    errorDesc3: "Or check",
    errorDesc4: "for correctness",
    tfsSettings: "TFS/Azure DevOps Account Settings",
    //creds view
    validate: "Validate and save",
    status: "Status: ",
    credsNoteText: "You must validate the entered data for correctness.",
    tfsPath: "TFS/Azure DevOps path (must start with 'http://' or 'https://' and end with '/')",
    tfsToken: "Personal Access Token",
    credsHeaderAdd: "Add account",
    credsHeaderEdit: "Edit account",
    save: "OK",
    tfsHeader: "Account settings",
    credsState1: "Not validated",
    credsState2: "Validating...",
    credsState4: "Server unavailable or the Personal Access Token is incorrect or expired",
    credsState5: "OK",
    credsState6: "This account is already added",
    //helpers
    throwNoTeams: "No available team projects found",
    throwQueryLoading: "Error while loading query",
    throwAuth:
        "Cannot authenticate with provided credentials, TFS/Azure DevOps path is incorrect or network problems occurred",
    throwUnknown: "Something went wrong during request processing",
    notifNewItem: ": new",
    notifChangedItem: ": changes",
    notifNewPR: ": new PR",
    notifChangedPR: ": PR changes",
    prsNew: " new pull requests",
    prsWasChanged: " pull requests changed",
    prNotificationsEnabled: "Enable PR notifications",
    //comps
    timeSinceCreated: "Time since created",
    revision: "Revision",
    priority: "Priority",
    severity: "Severity",
    addQuery: "Add query",
    actions: "Actions",
    ignoreNotif: "Ignore Notif.",
    ignoreIcon: "Ignore Icon",
    queryName: "Query name",
    teamProject: "Team project",
    sortPattern: "Work Items sort pattern: ",
    //lists
    mineOnTop: "Show my Work Items on top",
    settingsWIHeader: "Work Items",
    favoritesDescription: "IDs of Work Items you will see marked with a star.",
    favorites: "Favorites",
    forwardedDescription: "IDs of Work Items you will see marked with an arrow.",
    forwarded: "Forwarded",
    pinnedDescription: "IDs of Work Items you will see on top of query results.",
    pinned: "Pinned",
    deferredDescription: "IDs of Work Items you will see at the bottom of query results.",
    deferred: "Deferred",
    hiddenDescription: "IDs of Work Items that will be hidden from the list (until changes are made to them).",
    hidden: "Hidden",
    permawatchDescription:
        "IDs of Work Items that will be added to a special query and will remain there until manually removed.",
    permawatch: "Permawatch",
    keywords: "Keywords",
    keywordsDescription: "Work Items containing keywords will be highlighted in blue.",
    listsNote:
        "The same item cannot be in different lists. Adding an item to a new list will remove it from the old one.",
    addItemsInListNotice: "To add items to this list, use the context menu on the main screen.",
    //context
    copy: "Copy summary",
    copyId: "Copy ID",
    copyUrl: "Copy URL",
    removeFromList: "Remove from ",
    addToP: "Add to permawatch",
    addToF: "Add to favorites",
    addToForwarded: "Add to forwarded",
    addToD: "Add to deferred",
    addToH: "Hide until changes",
    addToPinned: "Pin",
    openExternal: "Open in browser",

    noteCommand: "Local note",
    noteDialog: "Local note text for work item",

    hasShelve: "This item has a shelveset",

    noAscii: "Currently, only ASCII characters are supported in the password.",
    cbTelemetry: "Allow usage stats collection",
    releaseNotes: "Release notes",

    localCaption: "Local version",
    localWarning:
        "App loaded with local scripts. The reason might be in the internet outage. Not all features available.",

    justUpdatedMessage1: "Flowerpot has been updated to version ",
    justUpdatedMessage2: "View changes",
    justUpdatedHide: "OK",

    listsClearAll: "Clear all",

    itemIsDone: "Done by ",
    done: "Done",

    localNoteHint: "Local note",
    globalNoteHint: "Global note written by ",

    openById: "Open by ID",
    openByIdText: "Enter the Work Item ID to open",

    showUnreads: "Mark new work items",
    markAllAsRead: "Mark all new work items as read",

    contributors: "Contributors: ",
    keyword: "Keyword",

    itemsWasChanged: " item(s) changed",
    itemsNew: " item(s) added",

    collection: "Collection",

    flowerbot: "Set up Flowerbot",

    quicksearch: "Quick Search",

    TenYearsAnny: "10 years of MR",

    feedbackAlert: "Flowerpot needs your ideas and feedback!",
    feedbackAlertButton: "Suggest an idea",
    feedbackSettingsButton: "Feedback and suggestions",
    feedbackWindowCaption: "Describe your idea, suggestion or feedback and press OK",
    feedbackSent: "Feedback sent successfully!",
    feedbackFailed: "Failed to send feedback",

    //quicklinks
    addLink: "Add quick link",
    linkName: "Name",
    linkUrl: "URL",
    linkColor: "Color",
    linkDialogCaption: "Adding link to Quick Links list",
    linkDialogNameLabel: "Display name",
    linkDialogUrlLabel: "URL",
    wrongCaptionOrUrl: "Name or URL is incorrect",
    noLinks: "add quick links...",
    cbQuickLinksLabel: "Show quick links on the main page",

    enterID: "Enter the Work Item ID to open",

    apploading: "Loading application and data...",

    settingsActionsHeader: "Actions",

    hideBanner: "Hide",

    installUpdate: "Install update",

    wiStatus: "Status: ",
    linksLimitReached: "You have reached maximum amount of Quick Links",

    infoHeader: "Information",
    fetchingInfoPageContent: "Loading info page content...",

    ddTableScale: "Work Items table font size: ",
    tableSizeSmall: "Small",
    tableSizeMedium: "Medium",
    tableSizeLarge: "Large",

    newItem: "New or updated Work Item",
    unreadPrHint: "New or updated Pull Request",

    selpAvailableHeader: "Available projects",
    noProjectsAvailable: "No projects available",
    selPHeader: "Select Projects",

    addProject: "Add project",
    projectName: "Project name",
    projectsTableSettingsHeader: "Projects for tracking pull requests",

    sectionAccount: "Accounts",
    sectionQueries: "Queries",
    sectionWI: "Work Items",
    sectionProjects: "Projects and Pull Requests",
    sectionQL: "Quick links",
    sectionCredits: "Other",
    sectionLists: "Lists",

    pullRequestsBlockCaption: "Pull requests",
    draftPullRequest: "Draft",

    settingsAccountChecked: "Validated",
    settingsAccountNotChecked: "Not validated",

    showMineOnly: "Show only my work items",

    statsSettingsHeader: "Usage statistics",
    sectionStats: "Statistics",
    statDisplayName_appStarts: "App starts",
    statDisplayName_workItemsArrived: "Work items arrived",
    statDisplayName_notificationsSent: "Notifications sent",
    statDisplayName_networkFailures: "Network failures",
    statDisplayName_minutesSpentInApp: "Minutes spent in app",
    statDisplayName_appVersionUpdated: "App updates",
    statDisplayName_workItemsOpened: "Work items opened",
    statDisplayName_workItemsInfoCopied: "Info copied",
    statDisplayName_usersNamesCopied: "Names copied",
    statDisplayName_workItemsAddedToLists: "Work items added to lists",
    statDisplayName_accountVerifications: "Account verifications",

    requiredReviewer: "Required",

    apiClientFetchError: "Error loading: ",

    unauthorized:
        "Your Personal Access Token has expired or is incorrect. Please specify a valid token in Account Settings.",

    appFatalError: "Application critical error",
    reload: "Reload",

    credsTokenInfo1: "To authorize in the application, you need to get a",
    credsTokenInfo2: "Personal Access Token",
    credsTokenInfo3:
        "in your TFS/Azure DevOps. Instructions for creating a token and a direct link to the token creation page are available using the buttons below:",
    credsTokenOpenDocs: "Open token creation documentation (Microsoft)",
    credsTokenOpenCreatePage: "Open token creation page in your TFS/Azure DevOps",
    credsTokenInfo4:
        "Please note that for the application to function fully, a token with the maximum access level is required.",

    prComments: "Resolved/Total comments",
    prMergeConflicts: "Conflict",
    groupPrFilter: "Team",

    showPublicQueries: "Show shared queries",

    addQueryByUrl: "Add by URL",
    checkQueryUrlAndAdd: "Check and add",
    queryUrlLabel: "Paste the query link to add it to the system",
    queryByUrlError1: "The provided link does not refer to a query",
    queryByUrlError2: "Query link is incorrect or you don't have permission to read this query",
    queryByUrlError3: "Cannot determine project name",

    enableIterationColors: "Use Iteration Path color coding",
    enableQueryColorCode: "Use color coding in query headers",

    expandCollapseAll: "Collapse/Expand all",

    prBanner: "To work with Pull Requests add Projects in settings",
    prBannerAction: "Add",

    acceptedByMeFilter: "Accepted by me",

    addAccount: "Add account",

    notFoundOrNoAccess: "Result not found or access denied",
    jsonParseError: "Invalid server response",
    noAccountWithGivenDomain: "No account with the specified domain name",
    hiddenPrFilter: "Hidden",
    hidePr: "Hide",
    unhidePr: "Unhide",

    exportSettingsWindowCaption:
        "Current application settings. Clicking OK will copy them. Paste them into the Import Settings window to apply.",
    importSettingsWindowCaption:
        "Paste the settings copied from another app into this field. Changes will be applied immediately, current settings will be deleted.",
    sectionImport: "Transfer settings",
    importSettingsDesc: "On this page you can export or import application settings",
    doExportSettings: "Export settings",
    doImportSettings: "Import settings",

    showEmptyQueries: "Show empty queries",
    showSearch: "Search",

    openWebVersion: "Open web version of Flowerpot",

    themeLight: "Light theme",
    themeDark: "Dark theme",
    themeSystem: "System theme (follows OS setting)",

    filterStatusPrefix: "Status: ",
    filterTypePrefix: "Type: ",
};

export default en;
