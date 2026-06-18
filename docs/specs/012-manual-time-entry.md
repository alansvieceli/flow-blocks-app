# Spec 012 - Registro Manual de Tempo

## Objective

Permitir que o usuário registre um bloco de tempo que já ocorreu, sem ter iniciado o timer. O fluxo cobre tanto trabalho (cria uma sessão) quanto pessoal (adiciona minutos ao plano do dia).

## Context

O usuário frequentemente esquece de iniciar o timer, mas sabe quanto tempo ficou em uma atividade. Hoje não há como registrar isso sem manipular dados diretamente. Esta spec adiciona uma tela dedicada de registro retroativo, acessível a partir da tela Início, logo abaixo do botão de nudge.

## Goals

- **Entrada de dados mínima**: o usuário informa horário de início, duração, tipo (trabalho ou pessoal) e a categoria/atividade correspondente.
- **Data flexível**: hoje ou ontem, selecionável via toggle — padrão: hoje.
- **Trabalho**: cria uma `Session` com `startedAt`, `endedAt` e `durationSeconds` calculados; requer categoria e, se houver equipes cadastradas, equipe.
- **Pessoal**: adiciona os minutos ao `PersonalDailyPlan` do dia selecionado, usando a mesma lógica do encerramento do nudge pessoal (`applyPersonalNudgeToDailyPlans`). Requer uma atividade pessoal selecionada.
- **Acesso**: botão "✏️ Registrar tempo manualmente" abaixo do card de nudge na tela Início — sempre visível, independentemente do estado do nudge ou da sessão ativa.
- **Duração via presets + custom**: 15m, 30m, 45m, 1h e campo livre. Padrão: nenhum selecionado.
- **Feedback de horário**: exibir "Término estimado: HH:MM" em tempo real conforme o usuário edita início e duração.
- **Após salvar**: voltar para a tela Início.

## Non-goals

- Sem edição de registros passados além de hoje e ontem.
- Sem nota opcional nesta versão (pode ser adicionada numa spec futura).
- Sem integração com o timer ativo — registro manual não interfere com uma sessão em andamento.
- Sem suporte a datas além de ontem.
- Sem validação de sobreposição de sessões.

## UI — Tela `/manual-entry`

Rota nova, navegada via `router.push('/manual-entry')` a partir da tela Início.

### Campos

| Campo             | Tipo                                     | Detalhe                                                                   |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| Tipo              | Toggle (Trabalho / Pessoal)              | Padrão: Trabalho                                                          |
| Quando            | Toggle (Hoje / Ontem)                    | Padrão: Hoje                                                              |
| Horário de início | Time picker nativo                       | Padrão: hora atual menos a duração selecionada (ou hora atual se nenhuma) |
| Duração           | Presets (15m, 30m, 45m, 1h) + "outro..." | "outro..." abre campo numérico em minutos                                 |
| Categoria         | `OptionPicker`                           | Visível somente no modo Trabalho                                          |
| Equipe            | `OptionPicker`                           | Visível somente no modo Trabalho, obrigatório se equipes existirem        |
| Atividade         | `OptionPicker`                           | Visível somente no modo Pessoal                                           |

### Exibição do término estimado

```
Início: 14:00  +  45 min  →  "Término estimado: 14:45"
```

Calculado em tempo real. Exibe `--` se duração não selecionada.

### Validação para habilitar o botão Salvar

- Duração selecionada (preset ou custom > 0)
- Horário de início preenchido
- Modo Trabalho: categoria preenchida; equipe preenchida se `teams.length > 0`
- Modo Pessoal: atividade preenchida

## Comportamento ao salvar

Ambos os modos dependem de um helper `combineDateAndTime(date: Date, hhmm: string): Date` que combina a data local selecionada (hoje ou ontem) com o horário digitado (ex: `"14:00"`) para produzir um `Date` correto. Este helper deve ser criado em `src/lib/`.

### Trabalho

- `startedAt` = `combineDateAndTime(selectedDate, startTime).toISOString()`
- `endedAt` = startedAt + durationSeconds
- Cria uma `Session` com `note: null` e persiste via `updateSessions`

### Pessoal

- `startedAt` = `combineDateAndTime(selectedDate, startTime).toISOString()`
- Chama `applyPersonalNudgeToDailyPlans` passando `personalDailyPlans`, o `selectedDateStr` (YYYY-MM-DD) e um objeto compatível com os campos relevantes de `ActiveNudge`: `type: 'personal'`, `activityId`, `startedAt`, `durationSeconds`.
- Se a assinatura de `applyPersonalNudgeToDailyPlans` não aceitar um objeto parcial, extrair a lógica de atualização de plano para um helper compartilhado que receba apenas os campos necessários.
- A função já lida com a criação de uma nova entrada quando não existe nenhuma para o dia.

## Entry point na tela Início

Abaixo do card/botão de nudge, sempre renderizado:

```tsx
<TouchableOpacity onPress={() => router.push('/manual-entry')} activeOpacity={0.7}>
  <View style={styles.manualEntryBtn}>
    <Text style={styles.manualEntryText}>✏️ Registrar tempo manualmente</Text>
  </View>
</TouchableOpacity>
```

Visual: botão com borda pontilhada, fundo sutil (similar ao botão de nudge), cor secundária para não competir com as ações principais.

## Acceptance Criteria

- Botão "Registrar tempo manualmente" aparece na tela Início abaixo da área de nudge e navega para `/manual-entry`.
- O toggle Hoje/Ontem altera a data do registro sem mudar o layout.
- Presets de duração são mutuamente exclusivos; "outro..." exibe campo numérico em minutos.
- O término estimado atualiza em tempo real ao mudar início ou duração.
- Os campos de categoria/equipe aparecem somente no modo Trabalho; atividade somente no modo Pessoal.
- Equipe é obrigatória se `teams.length > 0`; opcional caso contrário.
- Botão Salvar desabilitado até validação completa.
- Salvar no modo Trabalho cria uma `Session` persistida via `updateSessions`; o registro aparece no Histórico e nas métricas do Painel.
- Salvar no modo Pessoal adiciona minutos ao `PersonalDailyPlan` do dia selecionado; se não houver entrada para a atividade, cria uma nova com status `done`.
- Após salvar, o app retorna à tela Início.
- `npm run check` passa.

## Validation Commands

```bash
npm run check
```
