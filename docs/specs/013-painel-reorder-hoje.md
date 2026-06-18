# Spec 013 - Reordenação do Painel e Card "Hoje"

## Objective

Reorganizar a aba Painel para que "Hoje" e "Aproveitamento" fiquem próximos do bloco "Esta Semana", enriquecer o card "Hoje" (hoje é apenas um total + 2 equipes) e remover a seção "Sequência", que não é uma métrica utilizável pelo usuário.

## Context

A aba Painel hoje renderiza, nessa ordem: Esta Semana, Mapa de Calor, Sequência, Hoje, Aproveitamento, Atividades Pessoais. O usuário quer "Hoje" e "Aproveitamento" próximos de "Esta Semana" (não no fim da tela), quer o card "Hoje" mais rico visualmente (hoje é só um número + nomes de equipe) e quer remover "Sequência" por não ser uma métrica que orienta decisão.

## Goals

- **Nova ordem das seções**: Hoje → Esta Semana → Mapa de Calor → Atividades Pessoais.
- **Remover a seção Sequência**: remover o bloco visual e a função `getStreak` em `src/lib/metrics.ts` (sem outros chamadores), junto dos testes de `getStreak`.
- **Fundir "Hoje" e "Aproveitamento" em um único card**, com:
  1. Barra de progresso do dia (`efficiency.todayWorkedMinutes` / `efficiency.todayAvailableMinutes`, com percentual), reaproveitando o componente `MetricBar` (accent `primary`).
  2. Divisão por categoria do dia (Foco / Reuniões), mesmo padrão visual (ícone + `MetricBar` + valor) do card semanal de categorias.
  3. Linha "Esta semana" (texto simples, sem barra): `efficiency.weekWorkedMinutes` / `efficiency.weekAvailableMinutes` (%), reaproveitando o estilo `switchRow` existente.
- **`DailyMetrics`** ganha `deepWorkMinutes` e `interruptionMinutes`, calculados com a mesma lógica de `isFocusCategory` usada em `getWeeklyMetricsByCategory`. `totalMinutes` e `topTeams` continuam existindo (usados em `app/(tabs)/index.tsx`).

## Non-goals

- Sem mudança no conteúdo da seção "Esta Semana" (categorias/equipes) — já definida na Spec 005 / revisão de UX do painel.
- Sem mudança nos filtros do heatmap.
- Sem equipes do dia com barra no card "Hoje" — já aparece na seção semanal, repetir por dia poluiria o card.
- Sem comparação com o dia anterior — métrica nova, sem necessidade clara agora; pode ser revisitada se fizer falta.

## UI — `app/(tabs)/dashboard.tsx`

### Card "Hoje" (novo, substitui `ExtrasSection` + `EfficiencySection`)

```
┌─────────────────────────────────┐
│ 4h 10m          / 7h 30m (56%)  │
│ ████████████░░░░░░░░░░░░░░░░░░  │  ← barra de progresso (trabalhado/disponível)
│─────────────────────────────────│
│ ⚡ Foco       ████████░░  2h 50m│
│ 🗓 Reuniões   ███░░░░░░░  1h 20m│
│─────────────────────────────────│
│ Esta semana   18h 40m / 33h (56%)│ ← linha de texto, sem barra
└─────────────────────────────────┘
```

### Ordem de renderização em `DashboardScreen`

`TodaySection` → `WeeklySection` → `HeatmapSection` → `PersonalChartSection`.

## Comportamento ao implementar

- Criar `TodaySection`, recebendo `dailyMetrics: DailyMetrics` e `efficiency: WorkEfficiency`, renderizando o card descrito acima.
- Remover `ExtrasSection` e `EfficiencySection` de `app/(tabs)/dashboard.tsx`.
- Remover o import de `getStreak` em `app/(tabs)/dashboard.tsx`.
- Reaproveitar estilos já existentes no arquivo (`switchRow`, `switchLabel`, `switchValue`, `switchUnit`, `metricRow`, `metricLabelRow`, `metricLabel`, `metricValue`, `barTrack`/`barFill` via `MetricBar`) — não duplicar CSS.
- Em `src/lib/metrics.ts`: estender `DailyMetrics` com `deepWorkMinutes`/`interruptionMinutes`, atualizar `getDailyMetrics`, remover `getStreak`.
- Em `src/lib/__tests__/metrics.test.ts`: remover os testes de `getStreak`; atualizar os testes de `getDailyMetrics` para cobrir os novos campos.

## Acceptance Criteria

- A aba Painel renderiza as seções na ordem: Hoje, Esta Semana, Mapa de Calor, Atividades Pessoais.
- Não existe mais seção "Sequência" no Painel, nem função `getStreak` em `src/lib/metrics.ts`.
- O card "Hoje" mostra: barra de progresso do dia com percentual, divisão Foco/Reuniões do dia, e linha de texto com o aproveitamento semanal.
- `getDailyMetrics` retorna `deepWorkMinutes` e `interruptionMinutes` corretos para as sessões do dia.
- `app/(tabs)/index.tsx` continua funcionando sem alterações (usa `topTeams` de `getDailyMetrics`).
- `npm run check` passa.

## Validation Commands

```bash
npm run check
```
