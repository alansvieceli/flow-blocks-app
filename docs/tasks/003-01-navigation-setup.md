# Task 003-01 - Navigation Setup

## Plan Reference

`docs/plans/003-time-tracker-plan.md`

## Status

Done

## Description

Add tab navigation with three tabs: **Tracker**, **History**, and **Teams**.

- Install navigation dependency if not already present (prefer Expo Router; fall back to React Navigation if Expo Router is not viable with the current SDK version).
- Create placeholder screens for Tracker, History, and Teams so navigation works end-to-end before any feature logic is added.
- Remove or replace the existing `App.tsx` placeholder content.
- Tab icons must be legible; use icons from `@expo/vector-icons` (already bundled with Expo).

## Acceptance Criteria

- App launches and shows three tabs.
- Navigating between tabs renders the correct placeholder screen.
- `npm run typecheck` and `npm run lint` pass.

## Result

Expo Router v4 instalado. Estrutura `app/(tabs)/` com três tabs: Tracker, History, Teams. Entry point alterado para `expo-router/entry`. Typecheck e lint passam.
