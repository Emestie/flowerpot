## 1.0.0

- after 7 years of Flowerpot development, 1.0 is finally here 🎉🎉🎉
- introducing plant branding: every new version will have a unique name, starting with Aglaonema
- fixed settings loss: the settings file is now written atomically and backed up
- if the settings file is damaged, the app warns about it and keeps a copy of the damaged file
- added support for Azure DevOps Services (cloud DevOps): an account can be connected by `https://dev.azure.com/organization/` or `https://organization.visualstudio.com/`
- fixed query and work item links when opening them in the browser for cloud accounts
- the maximum number of accounts is increased to 5
- fixed account flower icons: the icon is now always shown, including for accounts from imported settings
- the switches enabling queries and projects in settings are replaced with toggles
- added the Shire color scheme: a warm, earthy palette with a light and a dark side
- reworked the tray icon colour calculation: only enabled queries without "ignore icon" are counted, so the red icon no longer appears because of disabled queries and no longer flickers during refreshes
- fixed a bug that kept pull requests with nested reviewer groups out of the list: if the user belongs to a group nested inside a reviewer group, such a PR now counts as theirs

<Button id="go-to-old-changelog">Go to older versions</Button>
