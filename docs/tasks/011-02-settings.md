# Task 011-02 - Settings: nudgeAbandonHours

## Plan Reference

`docs/plans/011-activity-nudge-plan.md`

## Status

Pending

## Description

Add `nudgeAbandonHours` (default 8) to `AppSettings` and expose it as a picker in the Settings screen.

---

- [ ] **Step 1: Add field to `src/storage/settingsStorage.ts`**

```ts
export interface AppSettings {
  notificationsEnabled: boolean;
  historyMonths: number;
  nudgeAbandonHours: number;
}

const DEFAULTS: AppSettings = {
  notificationsEnabled: true,
  historyMonths: 4,
  nudgeAbandonHours: 8,
};
```

The `getSettings` function already spreads `DEFAULTS` over the stored value, so existing installs without this key automatically get `8`.

- [ ] **Step 2: Add picker to `app/settings.tsx`**

Add the options constant near the top of the file (after `HISTORY_MONTHS_OPTIONS`):

```ts
const NUDGE_ABANDON_OPTIONS = [
  { id: '1', label: '1 hora' },
  { id: '2', label: '2 horas' },
  { id: '4', label: '4 horas' },
  { id: '8', label: '8 horas' },
  { id: '12', label: '12 horas' },
  { id: '24', label: '24 horas' },
];
```

Add the new `OptionPicker` inside `SettingsScreen`, right after the existing `OptionPicker` for history months:

```tsx
<OptionPicker
  label="Descartar nudge abandonado após"
  items={NUDGE_ABANDON_OPTIONS}
  onSelect={(id) => update({ nudgeAbandonHours: Number(id) })}
  placeholder="Selecionar tempo"
  selectedId={String(settings.nudgeAbandonHours ?? 8)}
/>
```

- [ ] **Step 3: Update `DEFAULT_SETTINGS` in `src/state/AppDataProvider.tsx`**

Find this line:

```ts
const DEFAULT_SETTINGS: AppSettings = { notificationsEnabled: true, historyMonths: 4 };
```

Replace with:

```ts
const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  historyMonths: 4,
  nudgeAbandonHours: 8,
};
```

- [ ] **Step 4: Run check**

```bash
npm run check
```

Expected: passes with no type errors.

## Acceptance Criteria

- `AppSettings.nudgeAbandonHours` defaults to `8`.
- Picker appears in Settings screen under the history months picker.
- Changing the value persists across restarts.
- `npm run check` passes.
