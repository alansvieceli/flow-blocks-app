# Plan 011 - Activity Nudge

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a countdown nudge tool that notifies the user after a chosen duration and auto-saves time to sessions (work) or personal daily plan (personal).

**Architecture:** New `ActiveNudge` type + `activeNudgeStorage` mirrors the existing `ActiveSession` pattern. Home screen gains a nudge card (amber) and a stale-detection flow. A new modal screen handles creation. End logic writes to existing `sessions` or `personalDailyPlans` paths — no new storage keys for the saved data.

**Tech Stack:** React Native / Expo, AsyncStorage, expo-notifications (already installed), expo-router.

## Spec Reference

`docs/superpowers/specs/2026-06-17-activity-nudge-design.md`

---

## Tasks

| #   | File                                     | Description                                                        |
| --- | ---------------------------------------- | ------------------------------------------------------------------ |
| 1   | `docs/tasks/011-01-types-storage.md`     | Add `ActiveNudge` type and `activeNudgeStorage` with tests         |
| 2   | `docs/tasks/011-02-settings.md`          | Add `nudgeAbandonHours` to settings + picker in Settings screen    |
| 3   | `docs/tasks/011-03-notifications.md`     | Add `scheduleNudgeNotification` function with tests                |
| 4   | `docs/tasks/011-04-app-data-provider.md` | Wire `activeNudge` state + actions into `AppDataProvider`          |
| 5   | `docs/tasks/011-05-home-nudge-card.md`   | Home: nudge card, dashed button, stale detection, extend/end sheet |
| 6   | `docs/tasks/011-06-nudge-form.md`        | New `/nudge-form` modal screen for creating a nudge                |
| 7   | `docs/tasks/011-07-validate.md`          | Run checks and verify all acceptance criteria                      |

## Sequential Order

1 → 3 → 4 → 5 → 6 (each depends on the previous)
2 is independent (settings only) — can run after 1.
7 is last.

## Validation

```bash
npm run check
```

## Out of Scope

- Nudge history/log
- Recurring nudges
- Notes on nudge end
- Blocking simultaneous manual session + work nudge for same team
