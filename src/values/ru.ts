import { LocalizedStrings } from "./Strings";

const ru: LocalizedStrings = {
    //settings view
    refresh1m: "1 минута",
    refresh3m: "3 минуты",
    refresh5m: "5 минут",
    refresh10m: "10 минут",
    refreshdebug: "(debug) 10 секунд",
    sortPatternWeight: "Вес, Дата",
    sortPatternAssigned: '"Назначен", Дата',
    sortPatternId: "ID",
    notifModeAll: "Все",
    notifModeMine: "Только мои",
    notifModeNone: "Никакие",
    localeAuto: "Автоопределение",
    localeEn: "Английский",
    localeRu: "Русский",
    updateStateChecking: "Проверка наличия обновлений...",
    updateStateDownloading: "Загрузка обновлений...",
    updateStateReady: "Обновления готовы к установке. Нажмите чтобы начать",
    updateStateError: "Ошибка при обновлении. Нажмите чтобы попробовать еще раз",
    updateStateNone: "Проверить наличие обновлений",
    settingsHeader: "Настройки",
    editTfsSettingsBtn: "Настройки учетной записи",
    settingsBackButton: "OK",
    settingsQueriesHeader: "Отслеживаемые запросы",
    settingsOthersHeader: "Другие",
    ddLocalesLabel: "Язык: ",
    ddRefreshLabel: "Интервал обновления запросов: ",
    ddShowNotifLabel: "Показывать уведомления: ",
    cbIconLabel: "Менять иконку приложения только от событий, связанных с моими задачами",
    cbAutostartLabel: "Запускать вместе с Windows (применяется при перезапуске приложения)",
    settingsCreditsHeader: "Автор и обновления",
    versionWord: "Версия",
    accountSettingsHeader: "Учетная запись",
    customListsSettingsHeader: "Списки",
    quickLinksSettingsHeader: "Быстрые ссылки",
    //sel queries view
    loading: "Загрузка...",
    noQueriesAvailable:
        "Нет ни одного доступного вам запроса. Убедитесь, что добавили нужные в 'Избранное' в TFS/Azure DevOps.",
    selQHeader: "Выбор запросов",
    cancel: "Отмена",
    add: "Добавить",
    note: "Важно!",
    selqNote1: "Здесь видны только те запросы, которые ",
    selqNote2: "",
    selqNote3: "",
    selqNote4: "еще не были добавлены",
    selqNote5: " в список отслеживания.",
    selqAvailableHeader: "Доступные запросы",
    refresh: "Обновить",
    //main view
    noQueriesToWatch: "Нет отслеживаемых запросов",
    noQueriesToWatchText: "Добавьте их в настройках",
    mainHeader: "Запросы",
    settings: "Настройки",
    updateArrived: "Обновление доступно!",
    updateArrivedText1: "Обновление Flowerpot готово. ",
    updateArrivedText2: "его нажав на кнопку или перезапустив приложение.",
    install: "Установите",
    //error view
    errorHeader: "Ошибка :(",
    errorMsg: "Что-то пошло не так!",
    errorDesc1: "Вы можете вручную",
    errorDesc2: "страницу",
    errorDesc3: "Или проверить",
    errorDesc4: "на предмет корректности",
    tfsSettings: "Настройки TFS/Azure DevOps",
    //creds view
    validate: "Проверить и сохранить",
    status: "Статус: ",
    credsNoteText: "Вы должны проверить введенные данные на корректность.",
    tfsPath: "Путь к TFS/Azure DevOps (должен начинаться с 'http://' и заканчиваться '/')",
    tfsToken: "Персональный токен доступа",
    credsHeader: "Учетные данные",
    save: "OK",
    tfsHeader: "Настройки учетной записи",
    credsState1: "Не проверены",
    credsState2: "Проверка...",
    credsState3: "Сервер недоступен или путь к TFS/Azure DevOps не верный",
    credsState4: "Персональный токен доступа некорректен или истек",
    credsState5: "OK",
    //helpers
    throwNoTeams: "Не найдено доступных проектов",
    throwQueryLoading: "Ошибка при загрузке запроса",
    throwAuth:
        "Невозможно авторизоваться с предоставленными учетными данными, путь к TFS/Azure DevOps некорректен или проблемы с сетью",
    throwUnknown: "Что-то пошло не так во время обработки запроса",
    notifNewItem: ": новое",
    notifChangedItem: ": изменения",
    //comps
    timeSinceCreated: "Время с момента создания",
    revision: "Ревизия",
    priority: "Приоритет ",
    severity: "Важность ",
    addQuery: "Добавить запрос",
    actions: "Действия",
    ignoreNotif: "Игнор. уведом.",
    ignoreIcon: "Игнор. икон.",
    queryName: "Название запроса",
    teamProject: "Проект",
    sortPattern: "Сортировка результатов запроса: ",
    //lists
    manageLists: "Управление списками",
    mineOnTop: "Показывать мои рабочие элементы первыми",
    settingsWIHeader: "Рабочие элементы",
    listsHeader: "Списки",
    favoritesDescription: "ID рабочих элементов, которые будут помечены звездочкой.",
    favorites: "Избранные",
    forwardedDescription: "ID рабочих элементов, которые будут помечены стрелкой.",
    forwarded: "Делегированные",
    pinnedDescription: "ID рабочих элементов, которые будут отображаться вверху списка.",
    pinned: "Закрепленные",
    deferredDescription: "ID рабочих элементов, которые будут отображаться внизу списка.",
    deferred: "Отложенные",
    hiddenDescription:
        "ID рабочих элементов, которые будут скрыты из списка (до тех пор, пока в них не будут внесены изменения).",
    hidden: "Скрытые",
    permawatchDescription:
        "ID рабочих элементов, которые будут добавлены в специальный запрос и будут находиться там до тех пор, пока не будут вручную удалены.",
    permawatch: "Наблюдаемые",
    keywords: "Ключевые слова",
    keywordsDescription: "Рабочие элементы, содержащие ключевые слова, будут выделены голубым цветом.",
    listsNote:
        "Один и тот же элемент не может присутствовать в разных списках. Добавление элемента в новый список удалит его из старого.",
    addItemsInListNotice: "Для добавления элементов в этот список воспользуйтесь контекстным меню на главном экране.",
    //context
    copy: "Копировать сводку",
    copyId: "Копировать ID",
    removeFromList: "Исключить из ",
    addToP: "Добавить в наблюдаемые",
    addToF: "Добавить в избранное",
    addToForwarded: "Добавить в делегированные",
    addToD: "Добавить в отложенные",
    addToH: "Скрыть до изменений",
    addToPinned: "Закрепить",

    openExternal: "Открыть в браузере",

    noteCommand: "Локальная заметка",
    noteDialog: "Текст локальной заметки для рабочего элемента",

    hasShelve: "К этому элементу имеется шелв",

    noAscii: "На данный момент в пароле поддерживаются только ASCII символы.",
    cbTelemetry: "Разрешить сбор статистики использования",
    releaseNotes: "Что нового?",

    localCaption: "Локальная версия",
    localWarning:
        "Приложение использует локальную версию функционала. Причиной может быть отсутствие подключения к интернету. Не все новые функции доступны.",

    justUpdatedMessage1: "Flowerpot обновлен до версии ",
    justUpdatedMessage2: "Посмотреть изменения",
    justUpdatedHide: "ОК",

    listsClearAll: "Очистить все",

    itemIsDone: "Выполнено пользователем ",
    done: "Выполнено",

    localNoteHint: "Локальная заметка",
    globalNoteHint: "Глобальная заметка, написанная ",

    openById: "Открыть по ID",
    openByIdText: "Введите ID рабочего элемента, который нужно открыть",

    showUnreads: "Помечать новые рабочие элементы",
    markAllAsRead: "Отметить все новые рабочие элементы как прочитанные",

    contributors: "Участники: ",
    keyword: "Ключевое слово",

    itemsWasChanged: " элемента(ов) изменено",
    itemsNew: " элемента(ов) добавлено",

    moveToProd: "Запрос на перенос",

    collection: "Коллекция",

    flowerbot: "Настроить Flowerbot",

    flowerbotBanner1: "Встречайте Flowerbot - Telegram-бот для отслеживания ваших ошибок и задач.",
    flowerbotBanner2: "Попробовать.",

    quicksearch: "Быстрый поиск",

    TenYearsAnny: "10 лет МР",

    feedbackAlert: "Flowerpot нужны ваши идеи и пожелания!",
    feedbackAlertButton: "Предложить идею",
    feedbackSettingsButton: "Обратная связь и пожелания",
    feedbackWindowCaption: "Опишите вашу идею, предложение или отзыв и нажмите ОК",

    //quicklinks
    addLink: "Добавить быструю ссылку",
    linkName: "Имя",
    linkUrl: "URL",
    linkColor: "Цвет",
    linkDialogCaption: "Добавление ссылки в список быстрых ссылок",
    linkDialogNameLabel: "Отображаемое имя",
    linkDialogUrlLabel: "URL",
    wrongCaptionOrUrl: "Имя или URL введены не верно",
    noLinks: "добавьте быстрые ссылки...",
    cbQuickLinksLabel: "Показывать быстрые ссылки на главной странице",

    enterID: "Введите ID рабочего элемента, который нужно открыть",

    apploading: "Загрузка приложения и данных с сервера...",

    settingsActionsHeader: "Действия",
    hideBanner: "Скрыть",

    installUpdate: "Установить обновление",

    wiStatus: "Статус: ",
    linksLimitReached: "Вы достигли максимального количества быстрых ссылок",

    infoHeader: "Информация",
    fetchingInfoPageContent: "Загрузка содержимого информационной страницы...",

    rocketBanner1: "Встречайте Rocket - инструмент для запуска проектов и автоматизации!",
    rocketBanner2: "Попробовать Rocket",

    ddTableScale: "Размер шрифта в таблице рабочих элементов: ",
    tableSizeSmall: "Мелкий",
    tableSizeMedium: "Средний",
    tableSizeLarge: "Крупный",

    newItem: "Новый или обновленный рабочий элемент",

    selpAvailableHeader: "Доступные проекты",
    noProjectsAvailable: "Нет доступных проектов",
    selPHeader: "Выбор проектов",

    addProject: "Добавить проект",
    projectName: "Проект",
    projectsTableSettingsHeader: "Проекты для отслеживания запросов на вытягивание",

    sectionAccount: "Учетная запись",
    sectionQueries: "Запросы и списки",
    sectionWI: "Рабочие элементы",
    sectionProjects: "Проекты и запросы на вытягивание",
    sectionQL: "Быстрые ссылки",
    sectionCredits: "Прочие настройки",

    pullRequestsBlockCaption: "Запросы на вытягивание",
    draftPullRequest: "Черновик",

    settingsAccountChecked: "Проверен",
    settingsAccountNotChecked: "Не проверен",

    showMineOnly: "Показывать только мои Рабочие Элементы",

    statsSettingsHeader: "Статистика использования",
    sectionStats: "Статистика",
    statDisplayName_appStarts: "Запусков приложения",
    statDisplayName_workItemsArrived: "Рабочих элементов прилетело",
    statDisplayName_notificationsSent: "Отправлено уведомлений",
    statDisplayName_networkFailures: "Ошибок сети",
    statDisplayName_minutesSpentInApp: "Минут, проведенных в приложении",
    statDisplayName_appVersionUpdated: "Обновлений приложения",
    statDisplayName_workItemsOpened: "Открыто рабочих элементов",
    statDisplayName_workItemsInfoCopied: "Скопировано информаций",
    statDisplayName_usersNamesCopied: "Скопировано имен",
    statDisplayName_workItemsAddedToLists: "Добавлено рабочих элементов в списки",
    statDisplayName_accountVerifications: "Проверок учетной записи",

    mergeStatus: "Статус слияния",
    requiredReviewer: "Обязательный",

    apiClientFetchError: "Ошибка при загрузке: ",

    unauthorized:
        "Ваш персональный токен доступа истек или некорректен. Пожалуйста, укажите в настройках учетной записи корректный токен.",
};

export default ru;
