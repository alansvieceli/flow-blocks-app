# App Context - Flow Blocks

## App Name

Flow Blocks

## Summary

Flow Blocks is a React Native Expo application built with TypeScript. It helps a developer who works across multiple teams/projects track and visualize how their time is spent, using local-only storage (no backend, no sync, no auth).

## Target Problem

The user works for multiple teams (e.g. "Equipe X", "Equipe Y") — including nights and weekends — and wants to (1) track time per team/category with a simple start/stop timer, (2) set scheduled reminders with local notifications, (3) see where their time goes via charts (per team, per day, weekly and monthly totals), and (4) plan and track personal/leisure time (reading, gaming, rest, etc.) with a recurring weekly template and daily check-in.

## Roadmap (specs)

- Spec 003 - Time Tracker: start/stop time tracking per team and category, teams management, session history.
- Spec 004 - Reminders: scheduled local notifications, optionally linked to a category/team.
- Spec 005 - Time Visibility Dashboard: weekly metrics, hourly heatmap (filterable by team/category), focus streak, daily/weekly context-switch count, weekly team-balance alert.
- Spec 006 - Personal Time Planner: user-defined personal activities, recurring weekly templates per weekday, daily plan with check/no-check, personal time chart.
- Spec 007 - UI Layout: dark visual identity, 4-tab navigation, Home tracker, and persistent active-session banner.

Out of scope for now: external integrations (GitHub/Jira/Calendar), backend/sync, monetization, brain dump.

## Core Product Principles

- Android-first: validation and manual testing target Android emulator first.
- Simple and maintainable: avoid unnecessary dependencies and complex architecture.
- Spec-first workflow: new behavior should be documented in specs, plans, and tasks before implementation.

## Core Data Concepts

- `teams`: user-managed list of teams/projects (id, name, optional max weekly % target).
- `sessions`: recorded work blocks (category, team, timestamps, actual duration, optional note).
- `active_session`: one currently running work session, mirrored into a persistent banner above the tab bar.
- `settings`: app settings, including whether reminder notifications are enabled.
- `reminders`: scheduled one-off reminders (title, description, datetime, optional category/team, notification id).
- `personalActivities`: user-defined leisure activities (id, name).
- `personalWeeklyTemplate`: recurring plan per weekday (activity + planned duration).
- `personalDailyPlan`: per-local-date plan entries generated from the template, with `pending`, `done`, or `not-done` status.

Calendar-based metrics and daily plans use the device's local date/time, not UTC calendar days.

## Primary Navigation

- **Início**: daily metrics, new work block, active session card, tonight plan, personal chart.
- **Painel**: weekly metrics, heatmap, streak, context switches, and team-balance alerts.
- **Lembretes**: reminder list and creation/editing flow.
- **Mais**: Teams, History, personal activities, weekly template, and settings.

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
