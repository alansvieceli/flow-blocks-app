# Painel UX Review — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remover as seções "Trocas de Contexto" e "Alertas de Equipe" do Painel e revisar a seção "Esta Semana" com total em destaque, nomes mais claros e cores corretas.

**Architecture:** Todas as mudanças estão em `app/(tabs)/dashboard.tsx`. Nenhuma mudança em lógica de negócio ou bibliotecas de métricas — somente apresentação.

**Tech Stack:** React Native, TypeScript, Expo

---

### Task 1: Remover Trocas de Contexto e Alertas de Equipe

**Files:**

- Modify: `app/(tabs)/dashboard.tsx`

- [ ] **Step 1: Remover bloco TROCAS DE CONTEXTO de `ExtrasSection`**

Em `ExtrasSection`, remover a variável `contextSwitches` e o bloco JSX correspondente:

```tsx
// REMOVER esta linha:
const contextSwitches = getContextSwitches(sessions, today);

// REMOVER este bloco JSX (SectionTitle + View):
<SectionTitle icon="swap-horizontal-outline" label="TROCAS DE CONTEXTO" />
<View style={styles.card}>
  <View style={styles.switchRow}>
    <Text style={styles.switchLabel}>Hoje</Text>
    <Text style={styles.switchValue}>{contextSwitches.today}</Text>
    <Text style={styles.switchUnit}>trocas</Text>
  </View>
  <View style={[styles.switchRow, styles.switchRowSpaced]}>
    <Text style={styles.switchLabel}>Esta semana</Text>
    <Text style={styles.switchValue}>{contextSwitches.week}</Text>
    <Text style={styles.switchUnit}>trocas</Text>
  </View>
</View>
```

- [ ] **Step 2: Remover bloco ALERTAS DE EQUIPE de `ExtrasSection`**

Em `ExtrasSection`, remover a variável `alerts` e o bloco JSX condicional:

```tsx
// REMOVER esta linha:
const alerts = getTeamBalanceAlerts(sessions, teams, today);

// REMOVER este bloco JSX completo:
{
  alerts.length > 0 && (
    <>
      <SectionTitle icon="alert-circle-outline" label="ALERTAS DE EQUIPE" />
      {alerts.map((alert) => (
        <View key={alert.teamId} style={styles.alertCard}>
          <View style={styles.alertTextRow}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.alert} />
            <Text style={styles.alertText}>
              {alert.teamName}: {alert.actualPercent}% (meta: {alert.maxWeeklyPercent}%)
            </Text>
          </View>
        </View>
      ))}
    </>
  );
}
```

- [ ] **Step 3: Remover `alerts` de `DashboardScreen` e de `WeeklySection`**

Em `DashboardScreen` (função principal), remover:

```tsx
// REMOVER:
const alerts = getTeamBalanceAlerts(sessions, teams, today);
```

E remover o prop `alerts` da chamada de `WeeklySection`:

```tsx
// ANTES:
<WeeklySection
  categoryMetrics={categoryMetrics}
  teamMetrics={teamMetrics}
  alerts={alerts}
  weekIdleMinutes={efficiency.weekIdleMinutes}
/>

// DEPOIS:
<WeeklySection
  categoryMetrics={categoryMetrics}
  teamMetrics={teamMetrics}
  weekIdleMinutes={efficiency.weekIdleMinutes}
/>
```

Em `WeeklySection`, remover o prop `alerts` da interface e o uso interno:

```tsx
// ANTES (interface):
function WeeklySection({
  categoryMetrics,
  teamMetrics,
  alerts,
  weekIdleMinutes,
}: {
  categoryMetrics: CategoryMetrics;
  teamMetrics: TeamMetrics[];
  alerts: TeamBalanceAlert[];
  weekIdleMinutes: number;
});

// DEPOIS (interface):
function WeeklySection({
  categoryMetrics,
  teamMetrics,
  weekIdleMinutes,
}: {
  categoryMetrics: CategoryMetrics;
  teamMetrics: TeamMetrics[];
  weekIdleMinutes: number;
});
```

Remover também o uso de `alertIds` dentro de `WeeklySection` e o ícone de alerta na linha de equipe:

```tsx
// REMOVER estas linhas no corpo da função:
const alertIds = new Set(alerts.map((a) => a.teamId));

// REMOVER o ícone condicional dentro do map de teamMetrics:
{
  alertIds.has(tm.teamId) && (
    <Ionicons name="alert-circle-outline" size={13} color={colors.alert} />
  );
}
```

- [ ] **Step 4: Limpar imports não usados**

No topo do arquivo, remover do import de `metrics`:

- `TeamBalanceAlert`
- `getContextSwitches`
- `getTeamBalanceAlerts`

```tsx
// ANTES:
import {
  CategoryMetrics,
  TeamBalanceAlert,
  TeamMetrics,
  WorkEfficiency,
  WorkSchedule,
  getDailyMetrics,
  getContextSwitches,
  getHeatmapData,
  getStreak,
  getTeamBalanceAlerts,
  getWeeklyMetricsByCategory,
  getWeeklyMetricsByTeam,
  getWorkEfficiency,
} from '../../src/lib/metrics';

// DEPOIS:
import {
  CategoryMetrics,
  TeamMetrics,
  WorkEfficiency,
  WorkSchedule,
  getDailyMetrics,
  getHeatmapData,
  getStreak,
  getWeeklyMetricsByCategory,
  getWeeklyMetricsByTeam,
  getWorkEfficiency,
} from '../../src/lib/metrics';
```

- [ ] **Step 5: Remover styles não usados**

No `StyleSheet.create`, remover:

```tsx
alertCard: { ... },
alertTextRow: { ... },
alertText: { ... },
```

- [ ] **Step 6: Rodar verificação**

```bash
npm run check
```

Esperado: sem erros de TypeScript ou lint.

- [ ] **Step 7: Commit**

```bash
git add app/(tabs)/dashboard.tsx
git commit -m "feat: remove context switches and team alerts sections from dashboard"
```

---

### Task 2: Revisar seção "Esta Semana"

**Files:**

- Modify: `app/(tabs)/dashboard.tsx`

- [ ] **Step 1: Adicionar linha de total no topo do card de categorias**

Dentro de `WeeklySection`, no primeiro `<View style={styles.card}>`, adicionar antes das linhas de métrica:

```tsx
<View style={styles.card}>
  <View style={styles.totalRow}>
    <Text style={styles.totalLabel}>Total registrado</Text>
    <Text style={styles.totalValue}>{formatMinutes(total)}</Text>
  </View>
  <View style={styles.metricRow}>
  ...
```

- [ ] **Step 2: Renomear "Interrupções" para "Reuniões"**

```tsx
// ANTES:
<Text style={styles.metricLabel}>Interrupções</Text>

// DEPOIS:
<Text style={styles.metricLabel}>Reuniões</Text>
```

- [ ] **Step 3: Renomear "Ocioso" para "Sem sessão" e aplicar cor discreta**

```tsx
// ANTES:
<View style={[styles.metricRow, styles.metricRowSpaced]}>
  <View style={styles.metricLabelRow}>
    <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
    <Text style={styles.metricLabel}>Ocioso</Text>
  </View>
  <MetricBar
    value={weekIdleMinutes}
    total={categoryMetrics.totalMinutes + weekIdleMinutes}
    accent="primary"
  />
  <Text style={styles.metricValue}>{formatMinutes(weekIdleMinutes)}</Text>
</View>

// DEPOIS:
<View style={[styles.metricRow, styles.metricRowSpaced]}>
  <View style={styles.metricLabelRow}>
    <Ionicons name="time-outline" size={11} color={colors.textDisabled} />
    <Text style={[styles.metricLabel, { color: colors.textDisabled }]}>Sem sessão</Text>
  </View>
  <MetricBar
    value={weekIdleMinutes}
    total={categoryMetrics.totalMinutes + weekIdleMinutes}
    accent="disabled"
  />
  <Text style={[styles.metricValue, { color: colors.textDisabled }]}>{formatMinutes(weekIdleMinutes)}</Text>
</View>
```

- [ ] **Step 4: Adicionar suporte ao accent "disabled" em `MetricBar`**

```tsx
// ANTES:
function MetricBar({
  value,
  total,
  accent,
}: {
  value: number;
  total: number;
  accent: 'primary' | 'alert';
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  if (accent === 'primary') {
    return (
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${pct}%`, backgroundColor: colors.accentFrom },
          ]}
        />
      </View>
    );
  }
  return (
    <View style={styles.barTrack}>
      <View
        style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.alert }]}
      />
    </View>
  );
}

// DEPOIS:
function MetricBar({
  value,
  total,
  accent,
}: {
  value: number;
  total: number;
  accent: 'primary' | 'alert' | 'disabled';
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const fillColor =
    accent === 'primary'
      ? colors.accentFrom
      : accent === 'alert'
        ? colors.alert
        : colors.textDisabled;
  return (
    <View style={styles.barTrack}>
      <View
        style={[styles.barFill, { width: `${pct}%`, backgroundColor: fillColor }]}
      />
    </View>
  );
}
```

- [ ] **Step 5: Adicionar styles para o total**

No `StyleSheet.create`, adicionar:

```tsx
totalRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  paddingBottom: 10,
  marginBottom: 2,
  borderBottomWidth: 1,
  borderBottomColor: colors.cardBorder,
},
totalLabel: {
  fontSize: 12,
  color: colors.textSecondary,
},
totalValue: {
  fontSize: 18,
  fontWeight: '800',
  color: colors.textPrimary,
},
```

- [ ] **Step 6: Rodar verificação**

```bash
npm run check
```

Esperado: sem erros de TypeScript ou lint.

- [ ] **Step 7: Commit**

```bash
git add app/(tabs)/dashboard.tsx
git commit -m "feat: revise weekly section with total, clearer labels and idle color"
```
