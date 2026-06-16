# Task 007-03 - Home Screen

## Plan Reference

`docs/plans/007-ui-layout-plan.md`

## Status

Pending

## Description

Build the Home screen (`app/(tabs)/index.tsx`) with the full tracker entry point and the approved visual design.

**Layout (top to bottom):**

1. **Header**
   - Left: date string (e.g. "seg, 16 jun") in `textSecondary` color
   - Right: greeting that changes by time of day:
     - 05:00–11:59 → "Bom dia, Alan 👋"
     - 12:00–17:59 → "Boa tarde, Alan 👋"
     - 18:00–04:59 → "Boa noite, Alan 👋"
   - Greeting uses `screenTitle` typography in `textPrimary`.

2. **Daily metrics placeholder card**
   - Three columns side by side: "Total hoje", "Top equipe", "2ª equipe"
   - Show `--` or `0h 0m` as placeholder values (no real computation in this task)
   - Card style: gradient background (`cardFrom` → `cardTo`), `borderRadius: 18`, border `cardBorder`
   - This placeholder is replaced with real values in spec 005 task 005-05.

3. **"Novo bloco" card** (shown when no active session)
   - Section label: "NOVO BLOCO" (`sectionLabel` typography)
   - Category chips: Foco Profundo, Reuniões, Revisão, Admin (from `CATEGORIES` constant). Active chip uses primary gradient, inactive uses `chipInactiveBackground`/`chipInactiveText`.
   - Team chips: loaded from `teamsStorage`. Same chip style. Hidden if no teams exist.
   - "Iniciar" button: primary gradient (`accentFrom` → `accentTo`), `borderRadius: 12`, `fontWeight: '800'`. Disabled (opacity 0.4) until a category is selected (and a team if teams exist).
   - On press: writes to `activeSessionStorage` and switches to active session state.

4. **Active session card** (replaces "Novo bloco" when session is running)
   - "● Gravando" indicator: orange dot + label in `alert` color
   - Timer: elapsed time in `HH:MM:SS`, `fontSize: 44`, `fontWeight: '800'`, `textPrimary`
   - Category and team chips shown as read-only (active style, not pressable)
   - "Parar" button: destructive gradient (`destructiveFrom` → `destructiveTo`)
   - On stop: saves session to `sessionsStorage`, clears `activeSessionStorage`, shows an inline note input below the card. After submitting/skipping the note, card returns to "Novo bloco" state with quick-restart button.
   - Timer resumes from `startedAt` on mount (same logic as spec 003 Tracker screen).

**Implementation note:** move the tracker logic from `app/(tabs)/tracker.tsx` into the Home screen component. The tracker file can be removed from the tab bar but its logic is reused here.

## Acceptance Criteria

- Greeting text changes by time of day.
- Daily metrics card shows placeholder values.
- Category selection and team selection work as chips.
- Iniciar button is disabled until required fields are selected.
- Active session card shows live timer, Stop button, and note flow.
- Timer resumes correctly after backgrounding.
- Quick restart is available after stopping a session.
- `npm run typecheck` and `npm run lint` pass.
