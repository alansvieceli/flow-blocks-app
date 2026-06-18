# Design — Reordenação do Painel e Card "Hoje"

Data: 2026-06-18

## Objetivo

Reorganizar a aba Painel para que "Hoje" e "Aproveitamento" fiquem próximos do bloco "Esta Semana", enriquecer o card "Hoje" (hoje é apenas um total + 2 equipes) e remover a seção "Sequência", que não é uma métrica utilizável pelo usuário.

---

## Decisões

### Nova ordem das seções

1. **Hoje** (novo card fundido — substitui "Hoje" + "Aproveitamento")
2. **Esta Semana** (categorias + equipes — sem mudança de conteúdo)
3. **Mapa de Calor** (sem mudança)
4. **Atividades Pessoais** (sem mudança)

### Seção "Sequência" — removida

Não é uma métrica que o usuário consegue usar para tomar decisão. Remove o bloco visual e a função `getStreak` em `src/lib/metrics.ts` (não é usada em nenhum outro lugar do código), junto dos testes de `getStreak`.

### Card "Hoje" — fundido com "Aproveitamento"

Substitui as antigas seções "Hoje" (dentro de `ExtrasSection`) e "Aproveitamento" (`EfficiencySection`) por uma única `TodaySection`/card:

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

Conteúdo do card, de cima para baixo:

1. **Barra de progresso do dia** — `efficiency.todayWorkedMinutes` / `efficiency.todayAvailableMinutes`, com percentual. Reaproveita o componente `MetricBar` (accent `primary`).
2. **Divisão por categoria do dia** — Foco / Reuniões, minutos de hoje. Mesmo padrão visual (ícone + `MetricBar` + valor) usado no card semanal de categorias.
3. **Linha "Esta semana"** — texto simples (label, valor, unidade), reaproveitando o estilo `switchRow` já existente: `efficiency.weekWorkedMinutes` / `efficiency.weekAvailableMinutes` (%).

Fica fora do card (decisão tomada durante o brainstorming):

- **Equipes do dia com barra** — já aparece na seção semanal; repetir por dia poluiria o card.
- **Comparação com o dia anterior** — métrica nova, sem necessidade clara hoje; pode ser revisitada depois se fizer falta.

---

## Mudanças de dados (`src/lib/metrics.ts`)

- `DailyMetrics` ganha dois campos: `deepWorkMinutes` e `interruptionMinutes`.
- `getDailyMetrics` passa a calcular esses dois valores a partir das sessões de hoje (mesma lógica de `isFocusCategory` usada em `getWeeklyMetricsByCategory`), além de manter `totalMinutes` e `topTeams` (ainda usado em `app/(tabs)/index.tsx`).
- `getStreak` é removida (função e testes em `src/lib/__tests__/metrics.test.ts`), pois deixa de ter qualquer chamador.

## Mudanças em `app/(tabs)/dashboard.tsx`

- Remover `ExtrasSection` e `EfficiencySection`.
- Criar `TodaySection`, recebendo `dailyMetrics: DailyMetrics` e `efficiency: WorkEfficiency`, renderizando o card descrito acima.
- Reordenar a árvore de renderização no `DashboardScreen` para: `TodaySection` → `WeeklySection` → `HeatmapSection` → `PersonalChartSection`.
- Remover import de `getStreak`.
- Reaproveitar estilos existentes (`switchRow`, `switchLabel`, `switchValue`, `switchUnit`, `metricRow`, `metricLabelRow`, `metricLabel`, `metricValue`, `barTrack`/`barFill` via `MetricBar`) — não duplicar CSS.

## Fora do escopo

- Qualquer mudança na seção "Esta Semana" (categorias/equipes) — já definida no spec [2026-06-18-painel-ux-review-design.md](2026-06-18-painel-ux-review-design.md).
- Filtros do heatmap.
- Métrica de comparação com o dia anterior (fora do escopo, ver decisão acima).
