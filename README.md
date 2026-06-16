# Flow Blocks

Flow Blocks is a React Native Expo application built with TypeScript.

It helps a developer track work time across teams, schedule local reminders,
visualize time distribution, and plan personal/leisure activities. Data is stored
locally on the device with no backend, sync, authentication, or paid services.

## Current App Behavior

- Four main tabs: Início, Painel, Lembretes, and Mais.
- Início: start/stop work sessions by category and team, see today's work summary, active session state, tonight's personal plan, and personal activity chart.
- Painel: weekly category/team metrics, hourly heatmap, streak, context-switch counts, and team-balance alerts.
- Lembretes: create, edit, delete, and schedule local reminders.
- Mais: access Equipes, Histórico, Atividades, Template semanal, and Configurações.
- Active work sessions show a running banner above the tab bar from every tab.
- Personal daily plan entries can be pending, done, or not done; only done entries count in personal charts.

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

- `teams`
- `sessions`
- `active_session`
- `reminders`
- `settings`
- `personalActivities`
- `personalWeeklyTemplate`
- `personalDailyPlan`

Calendar-based summaries use the device's local date and time.

```

## Project Workflow

The project follows a spec-first workflow documented in `AGENTS.md` and `docs/standards/`:

1. Write or update a spec in `docs/specs/`.
2. Create a plan in `docs/plans/`.
3. Break the work into tasks in `docs/tasks/`.
4. Execute approved tasks one at a time.
5. Validate and update documentation after changes.

## Roadmap

Specs, plans, and tasks in `docs/` remain the source for planned and completed work.
```
