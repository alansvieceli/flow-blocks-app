# Design: Jornada de Trabalho e Tempo Ocioso

**Data:** 2026-06-18
**Status:** Aprovado

## Objetivo

Permitir que o usuário configure sua janela de trabalho diária (horário de início, fim e duração do almoço). Com base nessa configuração, o Painel calcula e exibe o tempo ocioso — o que sobrou dentro da janela de trabalho que não foi coberto por sessões reais — como métrica de eficiência e como preenchimento visual do heatmap.

## Modelo de Dados

Três novos campos adicionados à entidade `settings` existente:

```ts
workStartHour: number; // default: 8  (hora inteira, 0-23)
workEndHour: number; // default: 18 (hora inteira, 0-23)
lunchDurationMinutes: number; // default: 60
```

**Cálculo de tempo disponível por dia útil:**

```
disponível = (workEndHour - workStartHour) × 60 - lunchDurationMinutes
// ex: (18 - 8) × 60 - 60 = 540 min = 9h
```

**Cálculo de ocioso por dia útil:**

```
ocioso = disponível - Σ duração das sessões (type: 'focus', completed: true) naquele dia
// nunca negativo: se sessões > disponível, ocioso = 0
```

Nenhuma escrita nova no storage. O cálculo é derivado em tempo real na lib de métricas existente. Fins de semana são ignorados (sem janela, sem almoço, sem ocioso).

## Configurações

Nova seção **"Jornada de trabalho"** em `Mais → Configurações`, adicionada abaixo das configurações existentes.

**Campos:**

- **Início** — seletor de hora (ex: `08:00`) → salva `workStartHour`
- **Fim** — seletor de hora (ex: `18:00`) → salva `workEndHour`
- **Almoço** — seletor com opções fixas: 30 min, 45 min, 60 min, 90 min → salva `lunchDurationMinutes`

**Comportamento:**

- Edição inline, sem tela separada (segue padrão atual da tela de Configurações)
- Validação: `workEndHour > workStartHour`
- Alteração em qualquer campo reflete automaticamente no Painel na próxima renderização (via `AppDataProvider`)

**Dias úteis** são seg-sex, fixo no código. Fins de semana exibem sessões reais sem janela de trabalho e sem dedução de almoço.

## Painel

### Heatmap

- Células dentro da janela de trabalho (`workStartHour`–`workEndHour`) em dias úteis sem nenhuma sessão recebem cor "ocioso" — tom neutro/cinza escuro, visualmente distinto das sessões reais
- Células fora da janela continuam como hoje (vazias/escuras)
- Fins de semana: sem cor de ocioso, apenas sessões reais

### Métrica de eficiência (nova)

Nova card/seção no Painel com:

```
Semana atual: 24h trabalhadas / 36h disponíveis (67%)
Hoje: 4h30 trabalhadas / 9h disponíveis (50%)
```

- "Disponível" considera apenas dias úteis já passados + hoje (não projeta dias futuros da semana)
- "Trabalhadas" = soma das sessões com `type: 'focus'` e `completed: true` nesses dias

### Métricas semanais (breakdown existente)

- "Ocioso" aparece como categoria própria no breakdown semanal por categoria
- Representa o total de tempo ocioso da semana (soma dos dias úteis)
- Não entra no cálculo de context switches nem streak (é derivado, não sessão real)

## Não-escopo

- Configuração de dias úteis por dia da semana (fixo: seg-sex)
- Horários diferentes por dia da semana
- Ocioso em fins de semana
- Sessões do tipo ocioso persistidas no storage
- Exportação ou comparação de eficiência entre semanas
