# Spec 007 - UI Layout

## Objective

Apply the approved visual identity and navigation structure to all existing screens (specs 003). This spec does not add new features — it restructures navigation and replaces all styles to match the design defined in `docs/superpowers/specs/2026-06-16-ui-design.md`.

## Context

Spec 003 was implemented with a placeholder UI (light theme, 3-tab navigation). The approved design defines a dark theme, 4-tab navigation, and a different screen distribution. This spec brings the app to the approved design before specs 004–006 are built on top of it.

## Navigation

Replace the current 3-tab layout with 4 tabs:

| Tab       | Icon (Ionicons outline) | Screen                                      |
| --------- | ----------------------- | ------------------------------------------- |
| Início    | `home-outline`          | Home: daily metrics + new block + tonight   |
| Painel    | `grid-outline`          | Dashboard (placeholder — built in spec 005) |
| Lembretes | `notifications-outline` | Reminders (placeholder — built in spec 004) |
| Mais      | `ellipsis-horizontal`   | More menu: links to Teams, History, etc.    |

The Tracker functionality (category/team picker, timer, stop button) moves from its own tab to the Home screen. Teams and History move under "Mais".

## Visual Identity

### Colors (all screens)

| Token              | Value                        |
| ------------------ | ---------------------------- |
| Background         | `#0f0f1a`                    |
| Card background    | gradient `#1a1a2e → #16213e` |
| Card border        | `#2a2a4a`                    |
| Primary accent     | gradient `#7c3aed → #3b82f6` |
| Destructive (stop) | gradient `#dc2626 → #f97316` |
| Alert              | `#f97316`                    |
| Success / personal | `#16a34a`                    |
| Text primary       | `#ffffff`                    |
| Text secondary     | `#5a5a8a`                    |
| Text disabled      | `#2a2a4a`                    |

### Typography

- Screen titles: `fontSize: 18, fontWeight: '800', letterSpacing: -0.5`
- Section labels: `fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#3a3a6a'`
- Body: `fontSize: 12, color: '#ccc'`
- Metric numbers: `fontSize: 16–44, fontWeight: '800'`, primary color

### Components

- **Cards**: `borderRadius: 18`, gradient background, border `#2a2a4a`
- **Selection chips (active)**: primary gradient background, white text, `fontWeight: '700'`
- **Selection chips (inactive)**: background `#12122a`, text `#3a3a6a`, border `#2a2a4a`
- **Primary button (start)**: primary gradient, `borderRadius: 12`, `fontWeight: '800'`, purple shadow
- **Stop button**: destructive gradient, same geometry
- **Tab bar icons**: Ionicons outline, `22×22`, active `#7c3aed`, inactive `#2a2a4a`
- **Tab bar background**: `#0f0f1a`, top border `#1a1a2e`

## Screens

### Home (Início)

Top to bottom:

1. **Header**: date + greeting ("Bom dia, Alan 👋") — greeting changes by time of day (Bom dia / Boa tarde / Boa noite)
2. **"Novo bloco" card**: category chips + team chips + Start button — this is the tracker entry point
3. **Active session state**: when a session is running, the "Novo bloco" card is replaced by the active session card (pulsing orange dot + timer 44px + category/team chips read-only + Stop button + optional note field)

Daily metrics card (3 columns: Total hoje / top team / second team) is out of scope for this spec — add as placeholder only.

### Mais (menu)

Simple list with sections:

- **Trabalho**: Equipes, Histórico
- **App**: Lembretes (disabled — spec 004)

### Equipes

Same functionality as spec 003, restyled with dark theme and card layout.

### Histórico

Same functionality as spec 003, restyled with dark theme and card layout.

### Painel and Lembretes

Placeholder screens only ("Em breve"). Built in specs 004 and 005.

## Non-goals

- New features (charts, reminders, personal planner — specs 004–006)
- Animations or transitions
- Light theme
- Internationalization

## Acceptance Criteria

- App uses 4-tab navigation (Início, Painel, Lembretes, Mais).
- Background of all screens is `#0f0f1a`.
- Cards use gradient background and `borderRadius: 18`.
- Tab bar icons match the defined colors and icons.
- Tracker functionality (start/stop timer) works on the Home screen, not a separate tab.
- Teams and History are accessible via Mais.
- Active session indicator (timer) is visible from all tabs while a session runs — implemented as a persistent banner above the tab bar.
- Greeting changes by time of day.
- `npm run check` passes.

## Validation Commands

```bash
npm run check
```
