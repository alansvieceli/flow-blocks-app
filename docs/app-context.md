# App Context - Flow Blocks

## App Name

Flow Blocks

## Summary

Flow Blocks is a React Native Expo application built with TypeScript. It helps a developer who works across multiple teams/projects track and visualize how their time is spent, using local-only storage (no backend, no sync, no auth).

## Target Problem

The user works for multiple teams (e.g. "Equipe X", "Equipe Y") and wants to (1) run a configurable Pomodoro timer per work block, declaring a category and team/project before starting, (2) set scheduled reminders with local notifications, and (3) see where their focus time goes via weekly metrics, an hourly heatmap, and a focus streak.

## Roadmap (specs)

- Spec 003 - Pomodoro Time Tracking: configurable focus/break timer, categories, team/project management, session history.
- Spec 004 - Reminders: scheduled local notifications, optionally linked to a category/team.
- Spec 005 - Time Visibility Dashboard: weekly metrics, hourly heatmap (filterable by team/category), focus streak.

Out of scope for now: external integrations (GitHub/Jira/Calendar), backend/sync, monetization, brain dump.

## Core Product Principles

- Android-first: validation and manual testing target Android emulator first.
- Simple and maintainable: avoid unnecessary dependencies and complex architecture.
- Spec-first workflow: new behavior should be documented in specs, plans, and tasks before implementation.

## Core Data Concepts

- `teams`: user-managed list of teams/projects (id, name).
- `sessions`: recorded Pomodoro focus/break blocks (category, team, planned/actual duration, timestamps, completed flag).
- `settings`: default focus/break durations (25/5).
- `reminders`: scheduled one-off reminders (title, description, datetime, optional category/team, notification id).

## Primary Navigation

To be defined during spec 003 planning. Expected top-level areas: Pomodoro (setup + timer), History, Teams management, Reminders, Dashboard.

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
