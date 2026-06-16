# Task 004-03 - Reminders Screen

## Plan Reference

`docs/plans/004-reminders-plan.md`

## Status

Pending

## Description

Replace the Lembretes placeholder screen (`app/(tabs)/lembretes.tsx`) with the functional reminders list screen.

**Layout:**

- Screen background: `colors.background`.
- Header: title "Lembretes" (`screenTitle`) + "+ Novo" button (text in `colors.accentFrom`) that navigates to the reminder form.

**List structure:**

- **"Próximos" section**: reminders with `datetime` ≥ now, sorted by `datetime` ascending. Section label in `sectionLabel` typography.
- **"Passados" section**: reminders with `datetime` < now, sorted by `datetime` descending. Same label style. Rows rendered at reduced opacity (0.45).
- If both sections are empty: centered empty state "Nenhum lembrete. Toque em + Novo para criar." in `colors.textSecondary`.

**Each reminder row (card style):**

- Bell icon (`notifications-outline`, 18px, `colors.accentFrom`) on the left.
- Title in `textPrimary`, description in `textSecondary` (one line, truncated).
- Date/time formatted as "DD/MM/YYYY às HH:MM" in `textSecondary`.
- Category and/or team badge if set (small chip, inactive style).
- Tapping a row navigates to the reminder form in edit mode.
- Delete action: a trash icon button on the right of each row. On press, cancels the notification (via `cancelReminderNotification`) and removes the reminder from storage.

## Acceptance Criteria

- Reminders are split into Próximos and Passados sections.
- Passados section renders at reduced opacity.
- Tapping a row opens the edit form.
- Delete removes the reminder and cancels its notification.
- Empty state renders when no reminders exist.
- `npm run typecheck` and `npm run lint` pass.
