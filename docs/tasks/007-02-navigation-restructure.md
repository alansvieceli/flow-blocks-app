# Task 007-02 - Navigation Restructure

## Plan Reference

`docs/plans/007-ui-layout-plan.md`

## Status

Pending

## Description

Replace the current 3-tab layout (Tracker, History, Teams) with a 4-tab layout using Expo Router tab navigation.

**New tab structure:**

| Tab       | Route file                 | Icon (Ionicons)               | Screen                      |
| --------- | -------------------------- | ----------------------------- | --------------------------- |
| Início    | `app/(tabs)/index.tsx`     | `home-outline`                | Home (built in task 007-03) |
| Painel    | `app/(tabs)/painel.tsx`    | `grid-outline`                | Placeholder (task 007-06)   |
| Lembretes | `app/(tabs)/lembretes.tsx` | `notifications-outline`       | Placeholder (task 007-06)   |
| Mais      | `app/(tabs)/mais.tsx`      | `ellipsis-horizontal-outline` | Mais menu (task 007-04)     |

**Changes:**

- Remove `app/(tabs)/tracker.tsx`, `app/(tabs)/history.tsx`, and `app/(tabs)/teams.tsx` from the tab bar. The tracker logic moves to the Home screen (task 007-03). Teams and History become stack screens under Mais.
- Update `app/(tabs)/_layout.tsx` to define the 4 tabs above with Ionicons icons sized `22` and colors `tabActive`/`tabInactive` from `src/theme/colors.ts`.
- Tab bar `style`: `backgroundColor: colors.tabBarBackground`, `borderTopColor: colors.tabBarBorder`.
- Add stack routes for Teams and History (e.g. `app/equipes.tsx`, `app/historico.tsx`) so they remain navigable from the Mais menu. These files are placeholders for now — restyled in task 007-05.
- Existing Teams and History screen components are moved (or imported) to the new file paths without changing their logic.

## Acceptance Criteria

- App shows exactly 4 tabs: Início, Painel, Lembretes, Mais.
- Tab bar matches design tokens (colors, icon size).
- Old 3-tab routes no longer appear in the tab bar.
- Teams and History are still reachable as stack screens (navigation wired up even if not yet restyled).
- `npm run typecheck` and `npm run lint` pass.
