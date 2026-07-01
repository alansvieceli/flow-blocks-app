# Flow Blocks

Flow Blocks is a React Native Expo application built with TypeScript.

It helps a developer track work time across teams, schedule local reminders,
visualize time distribution, and plan personal/leisure activities. Data is stored
locally on the device with no backend, sync, authentication, or paid services.

## Current App Behavior

- Four main tabs: Início, Painel, Lembretes, and Mais.
- Flow Blocks has custom launch branding: installed app icons use a white-background cascading-blocks mark, Android notifications use a white transparent version of the same mark, and the splash screen uses the same logo identity as the in-app header.
- Início: start/stop work sessions by selecting a registered category and team from list pickers, see today's work summary, active session state, start an activity nudge, log a past session manually, and open a compact tonight plan shortcut.
- Painel: a "Hoje" card (worked-vs-available progress with a Foco/Reuniões/Sem sessão breakdown), an "Esta Semana" section (same pattern plus a per-team breakdown), an hourly heatmap that also shades idle work hours, and a personal activity chart.
- Lembretes: create, edit, delete, and schedule local reminders at the first instant of the selected minute.
- Mais: access Equipes, Categorias, Histórico, Atividades, Template semanal, and Configurações.
- Active work sessions show a running banner above the tab bar from every tab. A session can send periodic reminder notifications (configurable interval and count) so the user is alerted if they forget to stop the timer; all pending reminders are cancelled automatically when the session is stopped.
- Activity nudges can be started for personal or work activities, notify at the first instant of the target minute, and can be extended or ended; ending saves the selected/extended duration into the personal daily plan or work sessions.
- Past work sessions can be edited from Histórico (pencil icon per row) to correct start/end times; duration is recalculated automatically.
- Core local data is loaded through a shared app data provider to reduce tab flicker.
- Personal daily plan entries can be pending, done, or not done; only done entries count in personal charts.
- New installs start with category defaults `Reunião` and `Foco`, and personal activity defaults `Video Game` and `Estudo`; users can edit, order, or remove categories and teams. Any category can be marked "Conta como Foco" so its time counts as deep work in Painel charts instead of falling under "Reuniões".

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
notification preference, data retention in months, how long an expired nudge
can wait before being discarded as abandoned, a daily work window (start hour,
end hour, lunch duration) used by Painel to compute worked-vs-available
efficiency and idle time, and session reminder configuration (interval between
reminders while a session is active, and how many reminders to schedule per
session). Start/end hour can be set in 30-minute increments
(e.g. `08:30`). Sessions, reminders, and personal daily plans are pruned
according to the retention setting when app data is loaded or updated. The
Settings screen also provides a reset action that clears local app data and
cancels scheduled notifications.

On Android, the notification tray icon is configured through `expo-notifications`
with `assets/notification-icon.png` and the Flow Blocks accent tint. Android
builds also declare `SCHEDULE_EXACT_ALARM` so date-based reminders and nudges can
fire at the intended minute on Android 12+. These native notification settings
require a rebuilt app binary to appear on device.

## Project Workflow

The project follows a spec-first workflow documented in `AGENTS.md` and `docs/standards/`:

1. Write or update a spec in `docs/specs/`.
2. Create a plan in `docs/plans/`.
3. Break the work into tasks in `docs/tasks/`.
4. Execute approved tasks one at a time.
5. Validate and update documentation after changes.

## Roadmap

Specs, plans, and tasks in `docs/` remain the source for planned and completed work.
