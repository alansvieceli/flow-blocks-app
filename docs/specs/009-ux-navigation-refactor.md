# Spec 009 - UX Navigation Refactor

## Objective

Reformulate the app navigation and screen composition so Flow Blocks feels like one cohesive 4-tab app instead of separate feature screens stitched together. The main goals are smoother transitions, less flicker while data loads, consistent action placement, and a clearer role for each tab.

## Context

Specs 003-007 delivered the core product areas: work session tracking, reminders, dashboard, personal planning, and dark UI layout. As these areas were implemented independently, the app accumulated inconsistent screen patterns:

- Some actions live in headers, while similar actions use floating action buttons elsewhere.
- Several screens fetch AsyncStorage independently and briefly render empty states before real data arrives.
- Home is overloaded with tracker, metrics, tonight plan, and personal chart.
- "Mais" mixes navigation, configuration, and personal/work management without a clear information architecture.
- Stack transitions feel abrupt because list screens and edit screens use inconsistent navigation patterns.

This spec keeps the existing product capabilities but reorganizes how they are presented.

## Navigation Model

The app remains a 4-tab app:

| Tab       | Role                 | Content                                                                 |
| --------- | -------------------- | ----------------------------------------------------------------------- |
| Início    | Daily action hub     | Active session / new block, compact today summary, compact tonight link |
| Painel    | Analysis and metrics | Work metrics, heatmap, streak, context switches, personal summary       |
| Lembretes | Reminder workflow    | Reminder list, FAB add action, reminder edit/create stack screen        |
| Mais      | Settings and library | Configurações, Equipes, Histórico, Atividades, Template semanal         |

The fourth tab remains **Mais**, not "Ajustes", because it contains both settings and library/history destinations.

## UX Principles

- Keep tabs stable: switching tabs should not visibly reset layout or flash empty content.
- Use one action pattern per screen type:
  - FAB for creating list items.
  - Inline icon buttons for row-level edit/delete.
  - Header back button for stack screens.
  - Primary bottom action only for form submit when appropriate.
- Avoid showing an empty state during normal loading. Use stable loading placeholders or keep previous content until fresh data arrives.
- Make Home lightweight. It should prioritize "what do I do now?" over dense analytics.
- Keep edit/create screens outside tab content as stack screens.
- Reuse common components for headers, sections, rows, empty/loading states, cards, and FABs.
- Use local device date/time consistently.

## Screen Direction

### Início

Primary purpose: start or monitor today's current work.

Keep:

- Greeting/header.
- Active session card when a session is running.
- New block card when no session is running.
- Compact daily summary.
- Compact "Esta noite" card as an entry point to the daily personal plan.

Remove or relocate:

- Full personal activity chart moves to Painel.
- Any dense dashboard content moves to Painel.

### Painel

Primary purpose: understand patterns.

Include:

- Weekly work metrics.
- Team/category breakdown.
- Heatmap.
- Streak and context switches.
- Personal time chart.
- Team-balance alerts.

Use stable section ordering and loading states. The screen should not reflow dramatically after AsyncStorage resolves.

### Lembretes

Primary purpose: manage reminders.

Include:

- Header title only.
- Reminder list grouped by upcoming/past.
- FAB `+` in the same position and style as other list screens.
- Reminder create/edit form as a stack screen.

No top-right "+ Novo" button.

### Mais

Primary purpose: settings, libraries, and secondary destinations.

Sections:

- **Trabalho**: Equipes, Histórico.
- **Pessoal**: Atividades, Template semanal.
- **App**: Configurações.

Use consistent rows with icons and descriptions where helpful. Avoid disabled rows for implemented screens.

## Data Loading and Flicker Reduction

Introduce a shared app-data layer for local AsyncStorage-backed data used across tabs. It may be implemented as React Context and hooks, without adding new dependencies.

The shared layer should:

- Load core datasets once near the app root.
- Expose refresh functions for feature screens.
- Keep previous data visible while refreshing.
- Provide explicit loading/error states.
- Update local state immediately after writes before persisting when safe.
- Avoid each tab rendering an empty state during initial fetch unless the data is truly empty.

Core datasets:

- teams
- sessions
- active session
- reminders
- settings
- personal activities
- personal weekly template
- personal daily plans

## Component Consolidation

Create or consolidate shared UI components under `src/components/common/`:

- `ScreenScaffold`
- `ScreenHeader`
- `SectionHeader`
- `Card`
- `ListRow`
- `FabButton`
- `EmptyState`
- `LoadingState`

Existing components can be moved or adapted if useful. Do not duplicate large UI structures across screens.

## Non-goals

- No backend, sync, or authentication.
- No new product features.
- No paid services.
- No new navigation library.
- No large animation framework dependency.
- No redesign of the visual identity tokens unless a token is missing for consistency.

## Acceptance Criteria

- The app still has exactly 4 tabs: Início, Painel, Lembretes, Mais.
- Home is simplified and no longer contains the full personal chart.
- Painel contains the moved personal chart and remains the analytics destination.
- Lembretes uses a FAB add button matching Atividades.
- Mais contains Trabalho, Pessoal, and App sections with implemented destinations only.
- Switching tabs does not flash incorrect empty states after data has loaded once.
- Active-session banner remains stable and does not cause jarring layout jumps.
- Common list/action patterns are reused instead of recreated per screen.
- AsyncStorage data access is centralized enough to avoid repeated independent first-load flicker across tabs.
- `npm run check` passes.
- README and `docs/app-context.md` are updated after implementation.

## Validation Commands

```bash
npm run check
```

Manual validation should include Android emulator or physical Android device navigation through all 4 tabs and stack screens.
