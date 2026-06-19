# Spec 014 - Categoria de Foco Configurável

## Objective

Permitir que o usuário marque categorias adicionais (além da categoria padrão travada "Foco") como "Foco", para que os gráficos do Painel (Hoje e Esta Semana) classifiquem corretamente o tempo de categorias customizadas como Foco profundo, em vez de cair tudo no balde "Reuniões".

## Context

Hoje `isFocusCategory` em `src/lib/categories.ts` é uma comparação fixa de string (`id === 'foco' || id === 'foco_profundo'`). Qualquer categoria criada pelo usuário (ex: "Código", "Admin", "Planejamento") cai automaticamente no balde de interrupções/"Reuniões" nos cards "Hoje" e "Esta Semana" do Painel, mesmo que represente trabalho de foco profundo. O usuário quer marcar quais categorias customizadas contam como Foco.

## Goals

- **`Category` ganha campo `isFocus?: boolean`** (`src/types/index.ts`). A categoria padrão travada "Foco" (`LOCKED_CATEGORY` em `src/lib/categories.ts`) tem `isFocus: true` explícito. Categorias novas/existentes sem o campo são tratadas como `false`.
- **`isFocusCategory` passa a receber a lista de categorias**: `isFocusCategory(id: CategoryId, categories: Category[] = DEFAULT_CATEGORIES): boolean`.
  - Se encontrar a categoria na lista: retorna `category.isFocus === true`.
  - Se NÃO encontrar (categoria deletada, ou id legado de dados antigos/teste como `'foco_profundo'`/`'reunioes'`): cai no fallback legado — `id === 'foco' || id === 'foco_profundo'` é Foco, qualquer outro id é Reuniões.
- **Classificação é sempre recalculada na leitura**, nunca gravada na sessão. Ligar/desligar o toggle de uma categoria reclassifica retroativamente todo o histórico existente nos cards "Hoje" e "Esta Semana" — sem migração de dados.
- **`getWeeklyMetricsByCategory` e `getDailyMetrics`** (`src/lib/metrics.ts`) passam a receber `categories: Category[]` como parâmetro adicional, repassando para `isFocusCategory(s.categoryId, categories)` internamente.
- **Chamadores atualizados** para passar `categories` do contexto:
  - `app/(tabs)/dashboard.tsx` (já tem `categories` no escopo, usado pelo `HeatmapSection`)
  - `app/(tabs)/index.tsx` (precisa passar a desestruturar `categories` de `useAppData()`, hoje não usa)
  - `src/lib/devSeed.ts`: a chamada `categories.filter((c) => isFocusCategory(c.id))` precisa passar a própria lista (`isFocusCategory(c.id, categories)`), senão usa o default global em vez da lista real passada para a função.
- **UI em `app/categories.tsx`**: o modal de criar/editar categoria ganha um `Switch` "Conta como Foco" (mesmo padrão visual de `app/settings.tsx`: `trackColor`/`thumbColor`), abaixo do campo "Ordem".
  - Estado novo `inputIsFocus: boolean`. `false` ao abrir criar; `category.isFocus ?? false` ao abrir editar.
  - `handleSave` inclui `isFocus: inputIsFocus` no objeto salvo (tanto criação quanto edição).
  - O toggle não precisa de tratamento especial para a categoria travada "Foco" — ela já não tem affordance de edição (ícones de editar/excluir só renderizam para categorias não travadas).
- **Indicador visual na listagem**: o ícone `flash-outline` na cor de destaque (`colors.accentFrom`), hoje exibido só para `isLockedCategory(item.id)`, passa a ser exibido para qualquer categoria com `isFocus: true` (incluindo a travada). Categorias sem `isFocus` continuam com o ícone `albums-outline` em `colors.textSecondary`.

## Non-goals

- Sem terceiro balde no gráfico (continua só Foco vs. Reuniões — "Reuniões" é tudo que não é Foco).
- Sem mudança no Mapa de Calor (não separa por Foco/Reuniões).
- Sem migração/reescrita de sessões existentes — a classificação é sempre calculada na leitura.
- Sem mudança de comportamento para a categoria travada "Foco" (continua sempre Foco, sem toggle visível).

## UI — Modal de categoria (`app/categories.tsx`)

```
┌─────────────────────────────────┐
│ Nova categoria                   │
│ ┌───────────────────────────┐   │
│ │ Nome da categoria          │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ Ordem                      │   │
│ └───────────────────────────┘   │
│ Conta como Foco          [ ⚪ ] │  ← novo Switch
│                                   │
│  [Cancelar]        [Salvar]      │
└─────────────────────────────────┘
```

### Listagem

Categorias com `isFocus: true` mostram o ícone `flash-outline` em `colors.accentFrom` (igual à categoria travada hoje); demais mostram `albums-outline` em `colors.textSecondary`.

## Acceptance Criteria

- `Category` tem o campo opcional `isFocus?: boolean`; `LOCKED_CATEGORY` (`foco`) tem `isFocus: true`.
- `isFocusCategory(id, categories)` classifica corretamente: categoria encontrada usa seu `isFocus`; categoria não encontrada cai no fallback legado (`foco`/`foco_profundo` = Foco).
- `getWeeklyMetricsByCategory` e `getDailyMetrics` aceitam `categories` e classificam cada sessão de acordo.
- `app/(tabs)/dashboard.tsx` e `app/(tabs)/index.tsx` passam `categories` corretamente nas chamadas a essas funções.
- `src/lib/devSeed.ts` usa a lista de categorias passada (não o default global) ao decidir quais sessões mock são Foco.
- No modal de criar/editar categoria, o Switch "Conta como Foco" salva corretamente o campo `isFocus`.
- Na listagem de categorias, qualquer categoria com `isFocus: true` mostra o ícone `flash-outline` em destaque.
- Marcar uma categoria existente como Foco reflete retroativamente nos cards "Hoje" e "Esta Semana" do Painel, sem precisar editar sessões antigas.
- `npm run check` passa.

## Validation Commands

```bash
npm run check
```
