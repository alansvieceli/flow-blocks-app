# Task 015-02 - Notification Helper

## Plan Reference

`docs/plans/015-session-reminder-plan.md`

## Status

Done

## Description

Adicionar `scheduleSessionReminderNotification` em `src/lib/notifications.ts`.

## Files Changed

- `src/lib/notifications.ts` — nova função exportada; recebe `{ startedAt, fireAt }`, calcula horas decorridas, agenda notificação local com título "Sessão em andamento"

## Validation

`npm run check` passou.
