# Flow Blocks

Flow Blocks is a React Native Expo application built with TypeScript.

It helps a developer track work time across teams, schedule local reminders,
visualize time distribution, and plan personal/leisure activities. Data is stored
locally on the device with no backend, sync, authentication, or paid services.

## Current App Behavior

- Four main tabs: Início, Painel, Lembretes, and Mais.
- Flow Blocks has custom launch branding: installed app icons use a white-background cascading-blocks mark, Android notifications use a white transparent version of the same mark, and the splash screen uses the same logo identity as the in-app header.
- Início: start/stop work sessions by selecting a registered category and team from list pickers, see today's work summary, active session state, start an activity nudge, and open a compact tonight plan shortcut.
- Painel: weekly category/team metrics, hourly heatmap, streak, context-switch counts, team-balance alerts, and personal activity chart.
- Lembretes: create, edit, delete, and schedule local reminders at the first instant of the selected minute.
- Mais: access Equipes, Categorias, Histórico, Atividades, Template semanal, and Configurações.
- Active work sessions show a running banner above the tab bar from every tab.
- Activity nudges can be started for personal or work activities, notify at the first instant of the target minute, and can be extended or ended; ending saves time into the personal daily plan or work sessions.
- Core local data is loaded through a shared app data provider to reduce tab flicker.
- Personal daily plan entries can be pending, done, or not done; only done entries count in personal charts.
- New installs start with category defaults `Reunião` and `Foco`, and personal activity defaults `Video Game` and `Estudo`; users can edit, order, or remove categories and teams.

## Requirements

- Node.js
- npm
- Android Studio with an Android emulator configured

Expo CLI can be used through `npx`, so no global install is required.

## Install

```bash
npm install
```

## Development

```bash
npx expo start
```

Useful shortcuts in the Expo terminal:

- Press `a` to open on Android emulator.
- Press `r` to reload the app.

For a native Android development build:

```bash
npx expo run:android
```

## Validation

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run test:coverage
```

The combined gate is:

```bash
npm run check
```

## Local Data

The app stores data in AsyncStorage on the device:

- `teams` ordered by a numeric `order` field
- `categories` ordered by a numeric `order` field
- `sessions`
- `active_session`
- `active_nudge`
- `reminders`
- `settings`
- `personalActivities`
- `personalWeeklyTemplate`
- `personalDailyPlan`

Calendar-based summaries use the device's local date and time. Settings control
notification preference, data retention in months, and how long an expired nudge
can wait before being discarded as abandoned. Sessions, reminders, and personal
daily plans are pruned according to the retention setting when app data is loaded
or updated. The Settings screen also provides a reset action that clears local
app data and cancels scheduled notifications.

On Android, the notification tray icon is configured through `expo-notifications`
with `assets/notification-icon.png` and the Flow Blocks accent tint. This requires
a rebuilt native app binary to appear on device.

## Project Workflow

The project follows a spec-first workflow documented in `AGENTS.md` and `docs/standards/`:

1. Write or update a spec in `docs/specs/`.
2. Create a plan in `docs/plans/`.
3. Break the work into tasks in `docs/tasks/`.
4. Execute approved tasks one at a time.
5. Validate and update documentation after changes.

## Roadmap

Specs, plans, and tasks in `docs/` remain the source for planned and completed work.
