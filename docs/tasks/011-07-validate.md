# Task 011-07 - Validate

## Plan Reference

`docs/plans/011-activity-nudge-plan.md`

## Status

Pending

## Description

Run all checks and verify every acceptance criterion from the spec.

---

- [ ] **Step 1: Run full check**

```bash
npm run check
```

Expected: lint, type-check, and all tests pass.

- [ ] **Step 2: Verify personal nudge flow**

1. Open app → home screen
2. Tap "⏱ Iniciar nudge de atividade" (dashed amber button)
3. Select "🎮 Pessoal" → pick an activity → pick a duration
4. Tap "▶ Iniciar Nudge"
5. Confirm: amber nudge card appears on home with countdown
6. Wait for notification (or set a 1-min duration for testing)
7. Tap notification → confirm extend/end sheet appears
8. Tap "+ 15 minutos" → confirm notification reschedules, card updates endsAt
9. Tap "Encerrar atividade" → confirm:
   - Nudge card disappears, dashed button returns
   - "Esta noite" section shows the activity as done (or a new entry appears)

- [ ] **Step 3: Verify work nudge flow**

1. Tap "⏱ Iniciar nudge de atividade"
2. Select "💼 Trabalho" → pick a team → pick a category → pick a duration
3. Tap "▶ Iniciar Nudge"
4. Confirm nudge card appears
5. Tap "Encerrar" directly on the card
6. Confirm: nudge card disappears
7. Navigate to Mais > Histórico → confirm a new session appears with the correct team, category, and duration

- [ ] **Step 4: Verify stale nudge auto-discard**

1. Manually set a nudge with `endsAt` more than 8h in the past (edit AsyncStorage in dev tools, or set `nudgeAbandonHours` to `0` in settings temporarily)
2. Kill and reopen the app
3. Confirm: no sheet appears, nudge card does not appear, dashed button shows

- [ ] **Step 5: Verify stale nudge sheet**

1. Manually set a nudge with `endsAt` 1h in the past and `nudgeAbandonHours = 8`
2. Kill and reopen the app
3. Confirm: extend/end sheet appears immediately on home screen

- [ ] **Step 6: Verify settings**

1. Navigate to Mais > Configurações
2. Confirm "Descartar nudge abandonado após" picker is present with options 1h–24h
3. Change value → kill and reopen app → confirm value persists

- [ ] **Step 7: Verify cannot start second nudge**

1. Start a nudge
2. Confirm the dashed "Iniciar nudge" button is replaced by the card (no way to open the form)

## Acceptance Criteria (from spec)

- User can start a personal nudge → notification fires → extend or end → activity marked done in "Esta noite".
- User can start a work nudge → notification fires → end → session in History and Painel.
- Home shows amber card when active; dashed button when inactive.
- Cannot start a second nudge while one is active.
- Extending reschedules the notification; old notification does not fire.
- Manual end triggers save logic correctly.
- Stale nudge < `nudgeAbandonHours` → extend/end sheet on next app open.
- Stale nudge ≥ `nudgeAbandonHours` → auto-discard, no save.
- `npm run check` passes.
