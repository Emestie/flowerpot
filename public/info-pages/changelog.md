_Release notes are not available in English for now_

## 0.6.10

-   добавлен фильтр PR, позволяющий исключить те PR, по которым уже выставлен положительный вердикт

## 0.6.9

-   иконки рабочих элементов теперь загружаются из ТФС (вместе с цветом)
-   добавлен счетчик командных ПР
-   возможность свернуть/развернуть блок ПР
-   возможность свернуть/развернуть все блоки одновременно
-   добавлена возможность окрашивать заголовок запроса в генерируемый цвет для улучшения визуального восприятия (включается в настройках рабочих элементов)
-   для новых пользователей добавлено отключаемое приглашение на работу с ПР
-   исправлена ошибка, при которой неправильно отображалась итерация, если она состояла из однословного пути
-   визуальные улучшения блоков ПР и Рабочих элементов

## 0.6.8

-   восстановлена функциональность подсветки обновленных рабочих элементов

## 0.6.7

-   последняя часть Iteration Path подсчевивается уникальным цветом для быстрого считывания. Эту опцию можно отключить в настройках рабочих элементов
-   установлен лимит на количество отображаемых аватарок ревьюверов ПР. Если их больше 5, будет отображаться счетчик переполнения с подсказкой в виде списка ревьюверов
-   исправлена ошибка, при которой быстрый поиск работал только в нижнем регистре
-   выделение непрочитанных отключено до полной переработки подсистемы в будущих версиях
-   удален индикатор "Shelve"

## 0.6.6

-   добавлен множественный быстрый поиск - используйте `;` в качестве разделителя
-   быстрый поиск теперь ищет по тегам и статусам
-   добавлена возможность добавления запросов по ссылке на них
-   переработана система срочности/важности - теперь отображается только один индикатор по весу: срочность, важность, ранг. Только отображаемый индикатор участвует в сортировке. Полная информация доступна в тултипе
-   уменьшены отступы в ячейках таблиц - помещается больше контента
-   на главной странице убран заголовок; при отсутствии активного фестиваля всегда отображается логотип приложения
-   переделан layout интерфейса приложения (техническое обновление)
-   исправлена ошибка, при которой не работала подсветка фамилий при быстром поиске
-   исправлена ошибка, при которой в permawatch могли некорретно отображаться статусы

## 0.6.5

-   новое отображение статусов рабочих элементов - теперь с цветами из Azure DevOps
-   в списке доступных запросов можно выбирать общие запросы (добавлена специальная галка)
-   в список доступных запросов теперь попадают запросы, находящиеся в папках (по техническим ограничениям доступен только один уровень вложенности)

## 0.6.4

-   добавлена возможность отключать отображение групповых ПР (галка видна только при их наличии, находится в заголовке блока)
-   исправлена ошибка, при которой нельзя было удалить рабочие элементы из списка Permawatch через контекстное меню

## 0.6.3

-   исправлена ошибка, при которой у пользователей с большим количеством групп не работала авторизация

## 0.6.2

-   добавлена поддержка групповых ПР: если пользователь входит в группу, которая является ревьювером, то такой ПР будет отображаться в списке
-   для ПР добавлено отображение количества комментариев (выполненных и общее)
-   настройка списков перенесена в собственный раздел настроек
-   исправлен баг, при котором отображалась пустая аватарка без имени, если рабочий элемент не был назначен
-   удален автоматический тег "->Prod"

## 0.6.1

-   при недостаточных правах на некоторых токенах могут не отображаться аватарки. Для такого случая добавлена аватарка по умолчанию, а также сокращено количество запросов к серверу за ними (добавлен механизм синглтон-промиса)

## 0.6.0

-   полное обновление стека API: отказ от устаревшего механизма авторизации NTLM, переход на авторизацию по токену
-   благодаря обновлению метода авторизации ускорена работа запросов в десятки раз
-   уменьшено количество запросов за рабочими элементами, что сильно ускоряет работу приложения
-   автоматическое получение токена для некоторых пользователей
-   добавлено отображение черновиков пулл реквестов
-   исправлен давний баг с загрузкой аватаров пользователей
-   исправлены некоторые элементы в темной теме
-   для каждого запроса реализована индивидуальная обработка ошибок
-   исправлена ошибка с неостанавливающимся таймером обновления при ошибке подключения к серверу
-   более точный механизм определения "текущего пользователя"
-   удалена поддержка macOS x86

## 0.5.3

-   теперь теги окрашены в разные цвета, вычисляемые на основе текста
-   обновлены пакеты и Electron
-   добавлена нативная поддержка процессоров Apple Silicon

## 0.5.2

-   для статуса рабочих элементов "Решенный" добавлен значок
-   исправлена иконка приложения на macOS Sonoma
-   обновлен сертификат разработчика

## 0.5.1

-   в отображении пулл реквестов добавлена новая информация: тэги, названия участвующих веток, статус возможности мержа, а также список ревьюверов с отметками об обязательности и статусе ревью

## 0.5.0

-   изменен хостинг для бекендных функций приложения с Heroku на Netlify
-   сборка приложения изменена: теперь и Electron и веб-интерфейс собираются с помощью Vite, что ускорило процесс сборки и упростило разработку
-   новый движок праздничных иконок: больше возможностей и независимость от версии приложения
-   рабочие элементы, находящиеся в списках, получили подсветку
-   последняя посещенная секция настроек теперь сохраняется между сессиями
-   исправлены некоторые мелкие ошибки, улучшена производительность, произведены оптимизации

## 0.4.5

-   добавлен список Делегированные (Forwarded), рабочие элементы выделяются зеленым цветом и стрелочкой

## 0.4.4

-   в настройки добавлен раздел статистики использования приложения
-   обновление пакетов и библиотек, закрытие уязвимостей

## 0.4.3

-   поля Team Project и Iteration Path теперь участвуют в быстром поиске

## 0.4.2

-   добавлена возможность отображать только "свои" рабочие элементы путем нажатия на кнопку в меню (тоггл). Состояние кнопки не сохраняется между сессиями
-   исправлена иконка для статуса Ready for Review

## 0.4.1

-   на странице настроек, в разделе настроек аккаунта, добавлена информация о текущей учетной записи
-   добавлено контекстное меню для пулл реквестов с возможностями копирования информации
-   добавлена возможность копировать номер пулл реквеста и имя его автора двойным кликом, аналогично рабочим элементам
-   Epic, User Story и Feature больше не подсвечиваются желтым, если имеют срочность "2"
-   для статуса Ready for Review добавлена иконка

## 0.4.0

-   добавлено отслеживание пулл реквестов. Для начала работы необходимо в окне настроек добавить интересующие проекты (аналогично запросам добавлена новая таблица). Пулл реквесты будут отображаться отдельным блоком на главной странице. Отображаются только те реквесты, в которых пользователь указан ревьювером либо является автором. В будущем возможно расширение функционала
-   обновлено окно настроек: теперь настройки разбиты по категориям
-   запросы к рабочим элементам, находящимся в списке "скрытых", выполняются в 5 раз реже
-   статус "непрочитанный" у рабочих элементов теперь выглядит более понятным и соответствующим подобному статусу (оранжевая точка вместо зеленой левой границы)
-   исправлена ошибка с февральской фестивальной иконкой
-   исправлена ошибка с именами без отчества

## 0.3.7

-   добавлена настройка размера шрифта в таблице рабочих элементов (мелкий (по умолчанию), средний, крупный)
-   возраст багов старше 60 дней теперь отображаются в месяцах (сокращение mo)
-   баннер и кнопка Rocket

## 0.3.6

-   добавлена возможность обновить один конкретный запрос с помощью соответствующей кнопки в правой части заголовка запроса
-   исправлена ошибка с невозможностью удалить одно ключевое слово из раздела списков
-   отображение этого чейнджлога теперь перенесено в приложение
-   добавлен механизм отображения статических и динамических страниц
-   убрано назойливое предложение оставить отзыв о приложении, появляющееся при чистой установке
-   новая домашняя страница приложения
-   внутренняя реструктуризация проекта
-   подписание кода на macOS (возможно заработают автообновления)

## 0.3.5

-   на Windows исправлена четкость иконки в трее
-   для системных таймеров добавлена возможность стартовать сразу после создания
-   исправлена ошибка, при которой фестивальная иконка появлялась только через час после запуска
-   в трей добавлена новая иконка - серая, она сигнализирует о проблемах с сетью или первичном старте с не загруженными данными

## 0.3.4

-   исправлена ошибка, при которой статус проверки логина и пароля не сохранялся, из-за чего окно появлялось при каждом запуске приложения
-   убраны упоминания о Flowerbot

## 0.3.3

-   для всех рабочих элементов добавлены текущие статусы. Доступны подсказки с текстовым описанием
-   увеличина максимальная длина названия "Быстрой ссылки" до 50
-   увеличено максимальное количество "Быстрых ссылок" до 20
-   добавлена возможность выделять текст "Быстрых ссылок" на странице настроек
-   изменено поведение автообновления на macOS, теперь вместо бездействия открывается страница последнего релиза на GitHub. Временно обновление на macOS будет возможно только в ручном режиме

## 0.3.2

-   временно отключено облачное (бесшовное) обновление Реакта, которое производилось в обход обновлений клиента Электрона
-   Electron обновлен с 9 версии до 15
-   закрыты критичкеские уязвимости, связанные с устареванием версии Electron
-   кардинально изменены API для поддержки обновленной версии и улучшеной безопасности
-   проведена оптимизация кода в зоне хуков Реакта
-   исправлено качество иконки в уведомлениях на macOS
-   добавлены иконки системного трея для экранов с высоким разрешением

## 0.3.1

-   реализована версия для macOS
-   исправлена ошибка с запоздалым отображением праздничных иконок
-   исправлено отображение экрана загрузки

## 0.3.0

-   стейт менеджер изменен с MobX на Redux
-   многократно увеличена производительность
-   исправлено множество ошибок, влияющих на циклический перерендеринг приложения
-   закрыто несколько утечек памяти
-   критически ускорен быстрый поиск по текущим рабочим элементам

## 0.2.21

-   добавлена возможность добавлять быстрые ссылки в строку меню
-   обновлена структура меню настроек
-   обновлены иконки быстрых действий
-   исправлены некоторые ошибки

## 0.2.20

-   исправлена ошибка с неработающими отзывами, если они содержали кириллицу
-   исправлена ошибка, при которой задачи без поля Rank окрашивались в желтый
-   добавлены новые типы рабочих элементов - Epic, User Story, Feature

## 0.2.19

-   обновлен порядок входа в аккаунт
-   добавлена возможность отправлять пожелания и информацию об ошибках разработчику

## 0.2.18

-   обновлена версия Electron
-   добавлена подсветка для результатов быстрого поиска

## 0.2.17

-   добавлено поле для фильтрации рабочих элементов по названию, идентификационному номеру или участникам

## 0.2.16

-   при наведении на метку "-> Prod" отображается источник создания метки

## 0.2.15

-   новые фестивальные иконки
-   хинт для кастомных меток теперь показывает весь текст
-   баннер Flowerbot

## 0.2.14

-   добавлена настройка, позволяющая отображать аватары пользователей
-   мелкие исправления

## 0.2.13

-   поддержка нескольких коллекций (изменен путь к ТФС в настройках), новые коллекции доступны через интерфейс добавления запросов
-   больше нельзя обновить список, пока другая загрузка еще не завершена
-   изменен внутренний механизм работы со списками
-   обновлен внешний вид

## 0.2.12

-   многострочные заметки

## 0.2.11

-   исправлена ошибка при работе с TFS 2019 - обновлен запрос на список доступных для добавления запросов
-   сборка инсталлятора
-   мелкие исправления

## 0.2.10

-   исправлена ошибка при работе с TFS 2019

## 0.2.9

-   элементы списка "избранные" больше не поднимаются в верх списка
-   добавлен список "закрепленные"
-   теперь вместе с заголовком элемента отображаются его теги
-   для комментария "прод" сделана специальная метка

## 0.2.8

-   улучшение стабильности и производительности: некоторые компоненты переведены на хуки
-   исправлена ошибка с обновлением запросов - индикатор отображается всегда, когда идет загрузка
-   перестроение механизма хранения результатов запроса - использование MobX вместо локального стейта
-   больше одного уведомления за раз не выводится

## 0.2.7

-   добавлен список ключевых слов - совпадающие элементы будут подсвечены
-   исправлены мелкие ошибки

## 0.2.6

-   добавлена настройка отключения "непрочитанных" рабочих элементов
-   добавлена кнопка, позволяющая "прочитать" все рабочие элементы
-   исправлена ошибка со странным поведением точки на иконке в трее (требуется полное обновление)

## 0.2.5

-   исправлена ошибка, при которой сохранялось состояние скролла во время перехода на другую страницу

## 0.2.4

-   состояние "непрочитанности" теперь хранится в LocalStorage и сохраняется между сессиями

## 0.2.3

-   попытка исправить редкую ошибку с отсутствующей иконкой при потери сети

## 0.2.2

-   двойнок клик по ID или ФИО копирует содержимое
-   мелкие исправления

## 0.2.1

-   возможность скрыть сообщение о факте обновления навсегда (можно реактивировать в настройках)
-   кнопка "Очистить все" для каждого списка на экране управления списками
-   возможность открыть любой рабочий элемент по его ID с главного окна
-   диалоги теперь реагируют на Enter
-   при наличии обновлений на главной странице появляется кнопка, вместо большого баннера

## 0.2.0

#### Переезд на Firebase

-   фронтенд часть приложения перенесена на серверы Firebase. Теперь для ее обновления не потребуется обновлять все приложение целиком (Electron). Это позволяет вносить правки во фронтенд без беспокойства пользователя и дополнительных релизов
-   в случае потери интернет-соединения вместо "облачной" версии будет использована локальная, которая может отставать на несколько версий (но с сохранением обратной совместимости)

#### Другие изменения

-   добавлено текстовое оповещение для случая, когда у пользователя по какой-то причине загрузилась локальная версия
-   отображение проекта, к которому относится рабочий элемент, во всполывающей подсказке (на итерации)
-   теперь при обновлении версии выдается соответствующее оповещение на главной странице, позволяющее увидеть список изменений
-   улучшена документация - добавлен список изменений

## 0.1.25

-   полировка темной темы (цвета)
-   мелкие исправления

## 0.1.24

-   исправлена ошибка с перезаписью настроек в случае перемещения/ресайза окна

## 0.1.23

-   темная тема
-   кнопка-ссылка на чейнджлог в настройках
-   попытка исправить ошибку с несохранением настроек в некоторых случаях

## 0.1.21

-   предупреждение, если пароль содержит символы, не входящие в набор ASCII (временное решение)
-   кнопка "обновить" на экране запросов
-   возможность установить обновление с экрана ввода входных реквизитов

## 0.1.20

-   исправление ошибок с множащимся таймером обновления в случае недоступности сервера
-   исправлена ошибка, возникающая при попытке загрузить удаленный на сервере запрос
-   теперь нельзя открыть больше одного Flowerpot за раз

## 0.1.18

-   рабочие элементы теперь реагируют на слова "шелв" и "shelve" в последней записи истории - отображается соответствующая метка на рабочем элементе
-   мелкие улучшения

## 0.1.17

-   локальные заметки для рабочих элементов (доступны через контекстное меню)
-   возможность скопировать только ID рабочего элемента
-   исправление иконок в трее (точка снова отображается при наличии "непрочитанных")

## 0.1.15

-   асинхронная загрузка рабочих элементов
-   новое отображение состояния загрузки запроса
-   уменьшен размер установочного файла (с ~66МБ до ~44МБ)

## 0.1.14

-   исправление иконки в таскбаре (png -> ico)
-   обновление обработчика ошибок

## 0.1.13 and lower

-   различные изменения и исправления, базовый функционал
