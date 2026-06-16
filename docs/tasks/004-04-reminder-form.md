# Task 004-04 - Reminder Form

## Plan Reference

`docs/plans/004-reminders-plan.md`

## Status

Pending

## Description

Build the create/edit reminder form as a modal or stack screen accessible from the Lembretes screen.

**Route:** `app/lembrete-form.tsx` (stack screen, accessible via navigation from the reminders list).

**Fields:**

| Field     | Required | Input type                                    |
| --------- | -------- | --------------------------------------------- |
| Título    | Yes      | Text input                                    |
| Descrição | No       | Multiline text input                          |
| Data      | Yes      | Date picker (`DateTimePicker`, mode `'date'`) |
| Hora      | Yes      | Time picker (`DateTimePicker`, mode `'time'`) |
| Categoria | No       | Chip selector (from `CATEGORIES` constant)    |
| Equipe    | No       | Chip selector (from `teamsStorage`)           |

**Save flow:**

1. Validate: title and datetime are required. Show inline error if missing.
2. Call `requestNotificationPermission()` if permission has not been granted. If denied, show message "Notificações desabilitadas — o lembrete será salvo mas não disparará uma notificação." and proceed.
3. Call `scheduleReminderNotification(...)` to get `notificationId` (may be `null` if scheduling fails).
4. If editing: call `cancelReminderNotification(existingNotificationId)` before scheduling the new one.
5. Save the `Reminder` object via `saveReminders(...)` (replacing if edit, appending if create).
6. Navigate back to the list.

**Edit mode:** when navigated with an existing `reminderId`, load the reminder from storage and pre-fill all fields.

**Delete from form:** show a "Excluir" button (destructive style) in the header or footer that cancels the notification and removes the reminder.

**Visual design:** same dark theme as other screens. Inputs: background `colors.cardFrom`, border `colors.cardBorder`, text `colors.textPrimary`, placeholder `colors.textSecondary`. "Salvar" button: primary gradient.

## Acceptance Criteria

- Form pre-fills correctly in edit mode.
- Saving creates a scheduled notification and persists the reminder.
- Editing reschedules the notification (old one cancelled).
- Deleting from the form works the same as deleting from the list.
- Permission denial is handled gracefully with a visible message.
- `npm run typecheck` and `npm run lint` pass.
