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
  2. Divisão por categoria do dia (Foco / Reuniões / Sem sessão), mesmo padrão visual (ícone + `MetricBar` + valor) do card semanal de categorias.
- **`DailyMetrics`** ganha `deepWorkMinutes` e `interruptionMinutes`, calculados com a mesma lógica de `isFocusCategory` usada em `getWeeklyMetricsByCategory`. `totalMinutes` e `topTeams` continuam existindo (usados em `app/(tabs)/index.tsx`).

> **Atualização (2026-06-19):** a linha "Esta semana" (texto, sem barra) foi removida do card "Hoje" e o equivalente — "Trabalhado" com barra de progresso — passou a viver no topo do card de categorias da seção "Esta Semana" (no lugar do antigo "Total registrado", que duplicava o valor de "Trabalhado"). O card "Hoje" ganhou uma linha "Sem sessão" (`efficiency.todayIdleMinutes` / `efficiency.todayAvailableMinutes`), espelhando a linha já existente em "Esta Semana". Isso evita repetir o mesmo número de minutos em dois lugares e dá ao card "Hoje" o mesmo trio Foco/Reuniões/Sem sessão do card semanal. Ver diagrama e critérios atualizados abaixo.

## Non-goals

- Sem mudança no conteúdo da seção "Esta Semana" (categorias/equipes) — já definida na Spec 005 / revisão de UX do painel.
- Sem mudança nos filtros do heatmap.
- Sem equipes do dia com barra no card "Hoje" — já aparece na seção semanal, repetir por dia poluiria o card.
- Sem comparação com o dia anterior — métrica nova, sem necessidade clara agora; pode ser revisitada se fizer falta.

## UI — `app/(tabs)/dashboard.tsx`

### Card "Hoje" (substitui `ExtrasSection` + `EfficiencySection`)

```
┌─────────────────────────────────┐
│ 4h 10m / 7h 30m (56%)            │
│ ████████████░░░░░░░░░░░░░░░░░░  │  ← barra de progresso (trabalhado/disponível)
│─────────────────────────────────│
│ ⚡ Foco        ████████░░  2h 50m│
│ 🗓 Reuniões    ███░░░░░░░  1h 20m│
│ ⬜ Sem sessão  ██████░░░░  3h 20m│  ← cinza, mesmo padrão de "Esta Semana"
└─────────────────────────────────┘
```

### Card "Esta Semana" (categorias) — topo atualizado

```
┌─────────────────────────────────┐
│ 18h 40m / 33h (56%)              │  ← "Trabalhado" (era "Total registrado")
│ ████████████░░░░░░░░░░░░░░░░░░  │  ← barra de progresso (trabalhado/disponível)
│─────────────────────────────────│
│ ⚡ Foco        ████████░░  6h 20m│
│ 🗓 Reuniões    ███░░░░░░░  2h 40m│
│ ⬜ Sem sessão  ██░░░░░░░░  2h 00m│
└─────────────────────────────────┘
```

### Ordem de renderização em `DashboardScreen`

`TodaySection` → `WeeklySection` → `HeatmapSection` → `PersonalChartSection`.

## Comportamento ao implementar

- Criar `TodaySection`, recebendo `dailyMetrics: DailyMetrics` e `efficiency: WorkEfficiency`, renderizando o card descrito acima.
- Remover `ExtrasSection` e `EfficiencySection` de `app/(tabs)/dashboard.tsx`.
- Remover o import de `getStreak` em `app/(tabs)/dashboard.tsx`.
- Reaproveitar estilos já existentes no arquivo (`metricRow`, `metricLabelRow`, `metricLabel`, `metricValue`, `barTrack`/`barFill` via `MetricBar`, `todayHeaderRow`/`todayHeaderValue`/`todayHeaderUnit`/`headerBarRow`) — não duplicar CSS. O par cabeçalho+barra (`todayHeaderRow`/`headerBarRow`) é compartilhado entre o card "Hoje" e o topo do card de categorias de "Esta Semana".
- Em `src/lib/metrics.ts`: estender `DailyMetrics` com `deepWorkMinutes`/`interruptionMinutes`, atualizar `getDailyMetrics`, remover `getStreak`.
- Em `src/lib/__tests__/metrics.test.ts`: remover os testes de `getStreak`; atualizar os testes de `getDailyMetrics` para cobrir os novos campos.

## Acceptance Criteria

- A aba Painel renderiza as seções na ordem: Hoje, Esta Semana, Mapa de Calor, Atividades Pessoais.
- Não existe mais seção "Sequência" no Painel, nem função `getStreak` em `src/lib/metrics.ts`.
- O card "Hoje" mostra: barra de progresso do dia com percentual, e a divisão Foco/Reuniões/Sem sessão do dia.
- O topo do card de categorias de "Esta Semana" mostra "Trabalhado" (trabalhado/disponível com percentual) seguido da mesma barra de progresso, sem repetir esse valor em uma linha "Total registrado" separada.
- `getDailyMetrics` retorna `deepWorkMinutes` e `interruptionMinutes` corretos para as sessões do dia.
- `app/(tabs)/index.tsx` continua funcionando sem alterações (usa `topTeams` de `getDailyMetrics`).
- `npm run check` passa.

## Validation Commands

```bash
npm run check
```
