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
- Spec 005 - Time Visibility Dashboard: weekly metrics and hourly heatmap (filterable by team/category). Originally also added a focus streak, context-switch count, and team-balance alert; all three were later removed from Painel (see Spec 013 and the Painel UX Review below) — the underlying functions still exist in `src/lib/metrics.ts` but are unused.
- Spec 006 - Personal Time Planner: user-defined personal activities, recurring weekly templates per weekday, daily plan with check/no-check, personal time chart.
- Spec 007 - UI Layout: dark visual identity, 4-tab navigation, Home tracker, and persistent active-session banner.
- Spec 008 - App Header Branding: shared app header, Flow Blocks logo treatment, and tab-specific header labels.
- Spec 009 - UX Navigation Refactor: simplified Home, analytics-focused Dashboard, polished Reminders flow, clearer Mais information architecture, and shared app data loading.
- Spec 010 - Launch Branding Assets: app icons, adaptive icon, favicon, and splash screen branding.
- Spec 011 - Activity Nudge: countdown nudges for personal or work activities, with local notification, extend/end flow, and save-on-end behavior.
- Spec 012 - Manual Time Entry: log a past work session by hand from Início, without starting a timer.
- Spec 013 - Painel Reorder + Hoje Card: Hoje/Esta Semana moved to the top of Painel, removed the unused Sequência (streak) section, merged Hoje into a single card with a worked/available progress bar and a Foco/Reuniões/Sem sessão breakdown.
- Spec 014 - Categoria de Foco Configurável: lets the user mark any category as "Foco" (`isFocus`) so custom categories are classified correctly as deep work instead of falling into "Reuniões".
- Work Schedule & Idle Time (`docs/superpowers/specs/2026-06-18-work-schedule-idle-design.md`): user-configurable daily work window (start/end hour, lunch duration) used to compute worked-vs-available efficiency for today/this week and to color idle heatmap cells.
- Painel UX Review (`docs/superpowers/specs/2026-06-18-painel-ux-review-design.md`): removed the Trocas de Contexto and Alertas de Equipe sections (unreferenced/confusing metrics), added a "Sem sessão" breakdown row, and kept team rows showing `% · time`.

Out of scope for now: external integrations (GitHub/Jira/Calendar), backend/sync, monetization, brain dump.

## Core Product Principles

- Android-first: validation and manual testing target Android emulator first.
- Simple and maintainable: avoid unnecessary dependencies and complex architecture.
- Spec-first workflow: new behavior should be documented in specs, plans, and tasks before implementation.

## Core Data Concepts

- `teams`: user-managed list of teams/projects (id, name, numeric order, optional max weekly % target).
- `categories`: user-managed list of work block categories (id, label, numeric order, optional `isFocus` flag). The locked default category `Foco` always has `isFocus: true`; any other category can be marked "Conta como Foco" so its time is classified as deep work instead of falling into "Reuniões" in Painel charts. New installs start with `Reunião` and `Foco`.
- `sessions`: recorded work blocks (category, team, timestamps, actual duration, optional note).
- `active_session`: one currently running work session, mirrored into a persistent banner above the tab bar.
- `active_nudge`: one currently running countdown nudge (personal or work), with start/end timestamps, original duration, notification id, and extension count.
- `settings`: app settings, including whether reminder notifications are enabled, how many months of data to retain, how long an expired nudge can wait before being discarded as abandoned, and a daily work window (`workStartHour`, `workEndHour` in 30-minute increments, `lunchDurationMinutes`) used to compute work efficiency and idle time.
- `reminders`: scheduled one-off reminders (title, description, datetime, optional category/team, notification id).
- `personalActivities`: user-defined leisure activities (id, name). New installs start with `Video Game` and `Estudo`.
- `personalWeeklyTemplate`: recurring plan per weekday (activity + planned duration).
- `personalDailyPlan`: per-local-date plan entries generated from the template, with `pending`, `done`, or `not-done` status.

Calendar-based metrics and daily plans use the device's local date/time, not UTC calendar days.

Sessions, reminders, and personal daily plans are pruned according to `settings.historyMonths` when app data is loaded or updated. Resetting the app from Settings clears local app data and cancels scheduled notifications.

Common tab data is loaded through a shared React provider (`AppDataProvider`) so screens can keep previous local data visible while refreshing instead of rendering incorrect empty states.

## Primary Navigation

- **Início**: compact daily metrics, new work block or active session card, activity nudge card/start button, a manual time entry shortcut for logging a past session, and tonight plan shortcut.
- **Painel**: a "Hoje" card (worked/available progress bar plus a Foco/Reuniões/Sem sessão breakdown), an "Esta Semana" section (the same worked/available/breakdown pattern plus a per-team `% · time` card), an hourly heatmap (filterable by team/category, idle work-hours shaded distinctly), and a personal activity chart.
- **Lembretes**: reminder list and creation/editing flow.
- **Mais**: Trabalho (Equipes, Categorias, Histórico), Pessoal (Atividades, Template semanal), and App (Configurações).

## Activity Nudge

The Home screen includes an amber activity nudge entry point. A nudge can be personal or work-related, has a selected duration, respects the app notification toggle, requires notification permission before starting, schedules a local notification for its end time, and shows countdown/progress while active. Notification times are normalized to the first instant of the selected minute (`HH:mm:00.000`) before being saved or passed to Expo. When time is up, the user can extend it by a preset duration or end it. Ending a personal nudge adds the selected/extended nudge duration to today's matching personal plan entry and marks it done, or creates a done entry when none exists; ending a work nudge creates a recorded work session. Stale nudges are discarded automatically after `settings.nudgeAbandonHours`.

## Work Schedule & Efficiency

Configurações has a "Jornada de trabalho" section with the daily work window: start hour, end hour (both selectable in 30-minute increments, e.g. `08:30`, `18:30`), and lunch duration. Weekday available minutes are derived as `(workEndHour - workStartHour) * 60 - lunchDurationMinutes`; weekends have no available window. Painel uses this to show, for today and for the current week, worked minutes vs. available minutes with a percentage, and an idle ("Sem sessão") breakdown alongside Foco/Reuniões. The heatmap shades work-window hours with no recorded session distinctly from hours outside the window.

## Branding

Flow Blocks uses a cascading-blocks logo built from the app accent gradient. The same identity appears in the app header, white-background installed app icons, Android adaptive icon, favicon, centered dark splash screen logo, and Android notification tray icon. The notification icon is a white transparent PNG configured through `expo-notifications` and tinted with the Flow Blocks accent color. Android builds declare `SCHEDULE_EXACT_ALARM` so reminder and nudge notifications scheduled for an exact date can fire at the intended minute on Android 12+.

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
