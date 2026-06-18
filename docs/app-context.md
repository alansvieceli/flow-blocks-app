# App Context - Flow Blocks

## App Name

Flow Blocks

## Summary

Flow Blocks is a React Native Expo application built with TypeScript. It helps a developer who works across multiple teams/projects track, nudge, plan, and visualize how their time is spent, using local-only storage (no backend, no sync, no auth).

## Target Problem

The user works for multiple teams (e.g. "Equipe X", "Equipe Y") — including nights and weekends — and wants to (1) track time per team/category with a simple start/stop timer, (2) start countdown nudges that notify them after a chosen duration and save time when ended, (3) set scheduled reminders with local notifications, (4) see where their time goes via charts (per team, per day, weekly and monthly totals), and (5) plan and track personal/leisure time (reading, gaming, rest, etc.) with a recurring weekly template and daily check-in.

## Roadmap (specs)

- Spec 003 - Time Tracker: start/stop time tracking per team and category, teams management, session history.
- Spec 004 - Reminders: scheduled local notifications, optionally linked to a category/team.
- Spec 005 - Time Visibility Dashboard: weekly metrics, hourly heatmap (filterable by team/category), focus streak, daily/weekly context-switch count, weekly team-balance alert.
- Spec 006 - Personal Time Planner: user-defined personal activities, recurring weekly templates per weekday, daily plan with check/no-check, personal time chart.
- Spec 007 - UI Layout: dark visual identity, 4-tab navigation, Home tracker, and persistent active-session banner.
- Spec 008 - App Header Branding: shared app header, Flow Blocks logo treatment, and tab-specific header labels.
- Spec 009 - UX Navigation Refactor: simplified Home, analytics-focused Dashboard, polished Reminders flow, clearer Mais information architecture, and shared app data loading.
- Spec 010 - Launch Branding Assets: app icons, adaptive icon, favicon, and splash screen branding.
- Spec 011 - Activity Nudge: countdown nudges for personal or work activities, with local notification, extend/end flow, and save-on-end behavior.

Out of scope for now: external integrations (GitHub/Jira/Calendar), backend/sync, monetization, brain dump.

## Core Product Principles

- Android-first: validation and manual testing target Android emulator first.
- Simple and maintainable: avoid unnecessary dependencies and complex architecture.
- Spec-first workflow: new behavior should be documented in specs, plans, and tasks before implementation.

## Core Data Concepts

- `teams`: user-managed list of teams/projects (id, name, numeric order, optional max weekly % target).
- `categories`: user-managed list of work block categories (id, label, numeric order). New installs start with `Reunião` and `Foco`.
- `sessions`: recorded work blocks (category, team, timestamps, actual duration, optional note).
- `active_session`: one currently running work session, mirrored into a persistent banner above the tab bar.
- `active_nudge`: one currently running countdown nudge (personal or work), with start/end timestamps, original duration, notification id, and extension count.
- `settings`: app settings, including whether reminder notifications are enabled, how many months of data to retain, and how long an expired nudge can wait before being discarded as abandoned.
- `reminders`: scheduled one-off reminders (title, description, datetime, optional category/team, notification id).
- `personalActivities`: user-defined leisure activities (id, name). New installs start with `Video Game` and `Estudo`.
- `personalWeeklyTemplate`: recurring plan per weekday (activity + planned duration).
- `personalDailyPlan`: per-local-date plan entries generated from the template, with `pending`, `done`, or `not-done` status.

Calendar-based metrics and daily plans use the device's local date/time, not UTC calendar days.

Sessions, reminders, and personal daily plans are pruned according to `settings.historyMonths` when app data is loaded or updated. Resetting the app from Settings clears local app data and cancels scheduled notifications.

Common tab data is loaded through a shared React provider (`AppDataProvider`) so screens can keep previous local data visible while refreshing instead of rendering incorrect empty states.

## Primary Navigation

- **Início**: compact daily metrics, new work block or active session card, activity nudge card/start button, and tonight plan shortcut.
- **Painel**: weekly metrics, heatmap, streak, context switches, team-balance alerts, and personal chart.
- **Lembretes**: reminder list and creation/editing flow.
- **Mais**: Trabalho (Equipes, Categorias, Histórico), Pessoal (Atividades, Template semanal), and App (Configurações).

## Activity Nudge

The Home screen includes an amber activity nudge entry point. A nudge can be personal or work-related, has a selected duration, schedules a local notification for its end time, and shows countdown/progress while active. When time is up, the user can extend it by a preset duration or end it. Ending a personal nudge marks/adds today's personal plan entry as done; ending a work nudge creates a recorded work session. Stale nudges are discarded automatically after `settings.nudgeAbandonHours`.

## Branding

Flow Blocks uses a cascading-blocks logo built from the app accent gradient. The same identity appears in the app header, white-background installed app icons, Android adaptive icon, favicon, and centered dark splash screen logo.

## Current Workflow

The project follows a spec-first workflow:

1. Write or update a spec in `docs/specs/`.
2. Create a plan in `docs/plans/`.
3. Break the work into tasks in `docs/tasks/`.
4. Execute approved tasks one at a time.
5. Validate and update documentation after changes.

Important project rules live in:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/standards/`
