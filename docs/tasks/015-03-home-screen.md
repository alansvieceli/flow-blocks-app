# Task 015-03 - Home Screen Integration

## Plan Reference

`docs/plans/015-session-reminder-plan.md`

## Status

Done

## Description

Integrar agendamento e cancelamento de lembretes no fluxo de início/parada de sessão.

## Files Changed

- `app/(tabs)/index.tsx`
  - Import de `scheduleSessionReminderNotification` adicionado
  - `handleStart`: lê `sessionReminderIntervalMinutes`, `sessionReminderCount` e `notificationsEnabled` das settings; agenda lote de notificações e salva IDs em `session.reminderNotificationIds`
  - `handleStop`: cancela todas as notificações pendentes via `cancelReminderNotification` antes de salvar a sessão

## Validation

`npm run check` passou.
