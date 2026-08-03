import { LocalizedStrings } from "./Strings";

const be: LocalizedStrings = {
    //settings view
    refreshNever: "Ніколі",
    refresh3m: "3 хвіліны",
    refresh5m: "5 хвілін",
    refresh10m: "10 хвілін",
    refresh20m: "20 хвілін",
    refreshdebug: "(debug) 10 секунд",
    sortPatternWeight: "Прыярытэт, Дата",
    sortPatternAssigned: '"Прызначаны", Дата',
    sortPatternId: "ID",
    notifModeAll: "Усе",
    notifModeMine: "Толькі мае",
    notifModeNone: "Выкл.",
    localeAuto: "Аўтавызначэнне",
    localeEn: "Англійская",
    localeRu: "Руская",
    localeBe: "Беларуская",
    updateStateChecking: "Праверка абнаўленняў...",
    updateStateDownloading: "Сцягванне абнаўлення...",
    updateStateReady: "Абнаўленне гатова да ўстаноўкі. Націсніце, каб пачаць",
    updateStateNone: "Праверыць абнаўленні",
    updateStateError: "Памылка абнаўлення. Націсніце, каб паўтарыць",
    settingsHeader: "Налады",
    editTfsSettingsBtn: "Налады ўліковага запісу",
    settingsBackButton: "OK",
    settingsQueriesHeader: "Запыты для адсочвання",
    settingsOthersHeader: "Іншыя",
    ddLocalesLabel: "Мова: ",
    ddRefreshLabel: "Інтэрвал аўтаматычнага абнаўлення запытаў: ",
    ddShowNotifLabel: "Абвесткі працоўных элементаў: ",
    cbIconLabel: "Мяняць іконку праграмы толькі ад падзей, звязаных з маімі задачамі",
    cbAutostartLabel: "Запускаць разам з Windows (прымяняецца пры перазапуску праграмы)",
    settingsCreditsHeader: "Аўтар і абнаўленні",
    versionWord: "Версія",
    accountSettingsHeader: "Уліковыя запісы",
    customListsSettingsHeader: "Спісы",
    quickLinksSettingsHeader: "Хуткія спасылкі",
    //sel queries view
    loading: "Загрузка...",
    noQueriesAvailable:
        "Няма даступных вам запытаў. Пераканайцеся, што дадалі патрэбныя ў 'Абранае' ў Azure DevOps.",
    selQHeader: "Выбар запытаў",
    cancel: "Адмена",
    add: "Дадаць",
    note: "Важна!",
    selqNote1: "Па тэхнічных прычынах для выбару даступныя запыты толькі на першым і другім узроўні іерархіі",
    selqAvailableHeader: "Даступныя запыты",
    refresh: "Абнавіць",
    //main view
    noAccountsSetup: "Няма настроеных акаўнтаў",
    noAccountsSetupText: "Дадайце іх у наладах",
    noQueriesToWatch: "Няма запытаў для адсочвання",
    noQueriesToWatchText: "Дадайце іх у наладах",
    settings: "Налады",
    updateArrived: "Абнаўленне даступнае!",
    updateArrivedText1: "Абнаўленне Flowerpot гатова. ",
    updateArrivedText2: "Усталюйце яго, націснуўшы кнопку ці перазапусціўшы праграму.",
    install: "Усталяваць",
    //error view
    errorHeader: "Памылка :(",
    errorMsg: "Нешта пайшло не так!",
    errorDesc1: "Вы можаце ўручную",
    errorDesc2: "старонку",
    errorDesc3: "Або праверыць",
    errorDesc4: "на карэктнасць",
    tfsSettings: "Налады ўліковага запісу Azure DevOps",
    //creds view
    validate: "Праверыць і захаваць",
    status: "Статус: ",
    credsNoteText: "Вы павінны праверыць уведзеныя даныя на карэктнасць.",
    tfsPath: "Шлях да Azure DevOps (павінен пачынацца з 'http://' або 'https://' і заканчвацца '/')",
    tfsToken: "Персанальны токен доступу",
    credsHeaderAdd: "Даданне ўліковага запісу",
    credsHeaderEdit: "Рэдагаванне ўліковага запісу",
    save: "OK",
    tfsHeader: "Налады ўліковага запісу",
    credsState1: "Не правераны",
    credsState2: "Праверка...",
    credsState4: "Сервер недаступны або персанальны токен доступу некарэктны ці скончыўся",
    credsState5: "OK",
    credsState6: "Такі акаўнт ужо дададзены",
    //helpers
    throwNoTeams: "Не знойдзена даступных праектаў",
    throwQueryLoading: "Памылка пры загрузцы запыту",
    throwAuth:
        "Немагчыма аўтарызавацца з прадстаўленымі ўліковымі данымі, шлях да Azure DevOps некарэктны ці праблемы з сеткай",
    throwUnknown: "Нешта пайшло не так падчас апрацоўкі запыту",
    notifNewItem: ": новае",
    notifChangedItem: ": змены",
    notifNewPR: ": новы PR",
    notifChangedPR: ": змены PR",
    prsNew: " новых PR",
    prsWasChanged: " PR зменены",
    prNotificationsEnabled: "Абвесткі аб PR",
    prNotifications: "Абвесткі аб запытах на выцягванне: ",
    sectionNotifications: "Абвесткі",
    settingsNotificationsHeader: "Абвесткі",
    requestNotificationPermission: "Запытаць дазвол на абвесткі",
    on: "Укл.",
    off: "Выкл.",
    //comps
    timeSinceCreated: "Час з моманту стварэння",
    revision: "Рэвізія",
    priority: "Прыярытэт",
    severity: "Важнасць",
    addQuery: "Дадаць запыт",
    actions: "Дзеянні",
    ignoreNotif: "Ігнараваць абвесткі",
    ignoreIcon: "Ігнараваць іконку",
    queryName: "Назва запыту",
    teamProject: "Праект",
    sortPattern: "Сартаванне вынікаў запыту: ",
    //lists
    mineOnTop: "Паказваць мае працоўныя элементы першымі",
    settingsWIHeader: "Паводзіны",
    favoritesDescription: "ID працоўных элементаў, якія будуць пазначаны зорачкай.",
    favorites: "Абранае",
    forwardedDescription: "ID працоўных элементаў, якія будуць пазначаны стрэлкай.",
    forwarded: "Дэлегаваныя",
    pinnedDescription: "ID працоўных элементаў, якія будуць адлюстроўвацца ўверсе спісу.",
    pinned: "Замацаваныя",
    deferredDescription: "ID працоўных элементаў, якія будуць адлюстроўвацца ўнізе спісу.",
    deferred: "Адкладзеныя",
    hiddenDescription: "ID працоўных элементаў, якія будуць схаваны са спісу (пакуль у іх не будуць унесены змены).",
    hidden: "Схаваныя",
    permawatchDescription:
        "ID працоўных элементаў, якія будуць дададзены ў спецыяльны запыт і будуць знаходзіцца там, пакуль не будуць выдалены ўручную.",
    permawatch: "Назіральныя",
    keywords: "Ключавыя словы",
    keywordsDescription: "Працоўныя элементы, якія змяшчаюць ключавыя словы, будуць вылучаны блакітным колерам.",
    listsNote:
        "Адзін і той жа элемент не можа прысутнічаць у розных спісах. Даданне элемента ў новы спіс выдаліць яго са старога.",
    addItemsInListNotice: "Для дадання элементаў у гэты спіс скарыстайцеся кантэкстным меню на галоўным экране.",
    //context
    copy: "Капіраваць зводку",
    copyId: "Капіраваць ID",
    copyUrl: "Капіраваць URL",
    removeFromList: "Выдаліць з ",
    addToP: "Дадаць у назіральныя",
    addToF: "Дадаць у абранае",
    addToForwarded: "Дадаць у дэлегаваныя",
    addToD: "Дадаць у адкладзеныя",
    addToH: "Схаваць да змен",
    addToPinned: "Замацаваць",
    openExternal: "Адкрыць у браўзеры",

    noteCommand: "Лакальная нататка",
    noteDialog: "Тэкст лакальнай нататкі для працоўнага элемента",

    hasShelve: "Да гэтага элемента маецца шэльф",

    noAscii: "На дадзены момант у паролі падтрымліваюцца толькі сімвалы ASCII.",
    cbTelemetry: "Дазволіць збор статыстыкі выкарыстання",
    releaseNotes: "Што новага?",

    localCaption: "Лакальная версія",
    localWarning:
        "Праграма выкарыстоўвае лакальную версію функцыяналу. Прычынай можа быць адсутнасць падключэння да інтэрнэту. Не ўсе новыя функцыі даступныя.",

    justUpdatedMessage1: "Flowerpot абноўлены да версіі ",
    justUpdatedMessage2: "Паглядзець змены",
    justUpdatedHide: "ОК",

    listsClearAll: "Ачысціць усё",

    itemIsDone: "Выканана карыстальнікам ",
    done: "Выканана",

    localNoteHint: "Лакальная нататка",
    globalNoteHint: "Глабальная нататка, напісаная ",

    openById: "Адкрыць па ID",
    openByIdText: "Увядзіце ID працоўнага элемента, які трэба адкрыць",

    showUnreads: "Пазначаць новыя працоўныя элементы і Pull Requests",
    markAllAsRead: "Адзначыць усе новыя працоўныя элементы і PR як прачытаныя",

    contributors: "Удзельнікі: ",
    keyword: "Ключавое слова",

    itemsWasChanged: " элементаў зменена",
    itemsNew: " элементаў дададзена",

    collection: "Калекцыя",

    flowerbot: "Наладзіць Flowerbot",

    quicksearch: "Хуткі пошук",

    TenYearsAnny: "10 гадоў МР",

    feedbackAlert: "Flowerpot мае патрэбу ў вашых ідэях і пажаданнях!",
    feedbackAlertButton: "Прапанаваць ідэю",
    feedbackSettingsButton: "Зваротная сувязь і пажаданні",
    feedbackWindowCaption: "Апішыце вашу ідэю, прапанову ці водгук і націсніце ОК",
    feedbackSent: "Водгук паспяхова адпраўлены!",
    feedbackFailed: "Не атрымалася адправіць водгук",

    //quicklinks
    addLink: "Дадаць хуткую спасылку",
    linkName: "Імя",
    linkUrl: "URL",
    linkColor: "Колер",
    linkDialogCaption: "Даданне спасылкі ў спіс хуткіх спасылак",
    linkDialogNameLabel: "Адлюстроўваемае імя",
    linkDialogUrlLabel: "URL",
    wrongCaptionOrUrl: "Імя або URL уведзены няправільна",
    noLinks: "дадайце хуткія спасылкі...",
    cbQuickLinksLabel: "Паказваць хуткія спасылкі на галоўнай старонцы",

    enterID: "Увядзіце ID працоўнага элемента, які трэба адкрыць",

    apploading: "Загрузка праграмы і даных...",

    settingsActionsHeader: "Дзеянні",

    hideBanner: "Схаваць",

    installUpdate: "Усталяваць абнаўленне",

    wiStatus: "Статус: ",
    linksLimitReached: "Вы дасягнулі максімальнай колькасці хуткіх спасылак",

    infoHeader: "Інфармацыя",
    fetchingInfoPageContent: "Загрузка зместу інфармацыйнай старонкі...",

    ddTableScale: "Памер шрыфта ў табліцы працоўных элементаў: ",
    tableSizeSmall: "Дробны",
    tableSizeMedium: "Сярэдні",
    tableSizeLarge: "Буйны",

    newItem: "Новы ці абноўлены працоўны элемент",
    unreadPrHint: "Новы ці абноўлены запыт на выцягванне",

    selpAvailableHeader: "Даступныя праекты",
    noProjectsAvailable: "Няма даступных праектаў",
    selPHeader: "Выбар праектаў",

    addProject: "Дадаць праект",
    projectName: "Праект",
    projectsTableSettingsHeader: "Праекты для адсочвання запытаў на выцягванне",

    sectionAccount: "Уліковыя запісы",
    sectionQueries: "Запыты",
    sectionWI: "Знешні выгляд",
    sectionProjects: "Праекты і запыты на выцягванне",
    sectionQL: "Хуткія спасылкі",
    sectionCredits: "Іншае",
    sectionLists: "Спісы",

    pullRequestsBlockCaption: "Запыты на выцягванне",
    draftPullRequest: "Чарнавік",

    settingsAccountChecked: "Правераны",
    settingsAccountNotChecked: "Не правераны",

    showMineOnly: "Паказваць толькі мае працоўныя элементы",

    statsSettingsHeader: "Статыстыка выкарыстання",
    sectionStats: "Статыстыка",
    statDisplayName_appStarts: "Запускаў праграмы",
    statDisplayName_workItemsArrived: "Працоўных элементаў прыляцела",
    statDisplayName_notificationsSent: "Адпраўлена апавяшчэнняў",
    statDisplayName_networkFailures: "Памылак сеткі",
    statDisplayName_minutesSpentInApp: "Хвілін, праведзеных у праграме",
    statDisplayName_appVersionUpdated: "Абнаўленняў праграмы",
    statDisplayName_workItemsOpened: "Адкрыта працоўных элементаў",
    statDisplayName_workItemsInfoCopied: "Скапіявана інфармацый",
    statDisplayName_usersNamesCopied: "Скапіявана імёнаў",
    statDisplayName_workItemsAddedToLists: "Дададзена працоўных элементаў у спісы",
    statDisplayName_accountVerifications: "Праверак уліковага запісу",

    requiredReviewer: "Абавязковы",

    apiClientFetchError: "Памылка пры загрузцы: ",

    unauthorized:
        "Ваш персанальны токен доступу скончыўся ці некарэктны. Калі ласка, укажыце ў наладах уліковага запісу карэктны токен.",

    appFatalError: "Крытычная памылка праграмы",
    reload: "Перазагрузіць",

    credsTokenInfo1: "Для аўтарызацыі ў праграме вам неабходна атрымаць",
    credsTokenInfo2: "персанальны токен доступу",
    credsTokenInfo3:
        "у вашым Azure DevOps. Інструкцыя па стварэнні токена і прамая спасылка на старонку стварэння токена даступныя па кнопках ніжэй:",
    credsTokenOpenDocs: "Адкрыць дакументацыю па стварэнні токена (Microsoft)",
    credsTokenOpenCreatePage: "Адкрыць старонку стварэння токена ў вашым Azure DevOps",
    credsTokenInfo4:
        "Звярніце ўвагу, што для паўнавартаснай працы праграмы неабходны токен з максімальным узроўнем доступу.",

    prComments: "Выкананыя/Усе каментарыі",
    prMergeConflicts: "Канфлікт",
    groupPrFilter: "Камандныя",

    showPublicQueries: "Паказваць агульныя запыты",

    addQueryByUrl: "Дадаць па URL",
    checkQueryUrlAndAdd: "Праверыць і дадаць",
    queryUrlLabel: "Устаўце спасылку на запыт, каб дадаць яго ў сістэму",
    queryByUrlError1: "Перададзеная спасылка не адносіцца да запытаў",
    queryByUrlError2: "Спасылка на запыт няправільная ці ў вас няма правоў для чытання гэтага запыту",
    queryByUrlError3: "Немагчыма вылічыць імя праекта",

    enableIterationColors: "Выкарыстоўваць колеравае разфарбаванне Iteration Path",
    enableQueryColorCode: "Выкарыстоўваць колеравае кадзіраванне ў загалоўках запытаў",

    expandCollapseAll: "Згарнуць/разгарнуць усе",

    prBanner: "Для працы з Pull Request дадайце праекты ў наладах",
    prBannerAction: "Дадаць",

    acceptedByMeFilter: "Прынятыя мной",

    addAccount: "Дадаць уліковы запіс",

    notFoundOrNoAccess: "Вынік не знойдзены або адсутнічаюць правы доступу",
    jsonParseError: "Некарэктны адказ сервера",
    noAccountWithGivenDomain: "Адсутнічае акаўнт з указаным даменным імем",
    hiddenPrFilter: "Схаваныя",
    hidePr: "Схаваць",
    unhidePr: "Выдаліць са схаваных",

    exportSettingsWindowCaption:
        "Налады бягучай праграмы. Пры націску на ОК яны будуць скапіяваны. Устаўце іх у акно імпарту наладак, каб прымяніць.",
    importSettingsWindowCaption:
        "Устаўце ў гэта поле налады, скапіяваныя з іншай праграмы. Змены будуць ужыты адразу, бягучыя налады будуць выдалены.",
    sectionImport: "Перанос наладак",
    importSettingsDesc: "На гэтай старонцы можна экспартаваць ці імпартаваць налады праграмы",
    doExportSettings: "Экспартаваць налады",
    doImportSettings: "Імпартаваць налады",

    showEmptyQueries: "Паказваць пустыя запыты",
    showSearch: "Пошук",

    openWebVersion: "Адкрыць вэб-версію Flowerpot",

    themeLight: "Светлая",
    themeDark: "Цёмная",
    themeSystem: "Сістэмная",
    settingsThemesHeader: "Інтэрфейс",
    ddThemeLabel: "Тэма: ",
    ddColorSchemeLabel: "Колеравая схема: ",
    colorSchemeClassic: "Класічная",
    colorSchemeFlexoki: "Flexoki",

    flexokiBannerText: "Даступная новая колеравая схема Flexoki! Паспрабуйце яе ў Налады → Інтэрфейс.",
    flexokiBannerAction: "Паспрабаваць",

    filterStatusPrefix: "Статус: ",
    filterTypePrefix: "Тып: ",
};

export default be;
