# Spec 015 - Lembrete Periódico de Sessão Ativa

## Objective

Notificar o usuário periodicamente enquanto uma sessão de trabalho estiver ativa, evitando que ele esqueça o timer rodando por horas sem perceber.

## Context

O usuário inicia um bloco de tempo e pode fechar o app ou se distrair. Como o app não tem background tasks confiáveis no React Native, a solução é agendar um lote de notificações locais no momento em que a sessão começa — cada uma disparando em `startedAt + N × intervalo`. Ao parar a sessão, todas as notificações pendentes são canceladas.

## Goals

- **Notificações periódicas**: ao iniciar uma sessão, agendar um lote de notificações locais no intervalo configurado.
- **Quantidade configurável**: o usuário define quantas notificações agendar por sessão (padrão: 12).
- **Intervalo configurável**: o usuário define o intervalo entre lembretes (padrão: 60 min). Pode desativar o recurso selecionando "Desativado".
- **Cancelamento automático**: ao parar a sessão, todas as notificações pendentes do lote são canceladas.
- **Settings**: as duas opções ficam na tela de Configurações, num grupo "Sessão ativa".

## Non-goals

- Sem reagendamento dinâmico ao abrir o app (lote fixo no início da sessão).
- Sem ação especial ao tocar na notificação além de abrir o app na tela inicial.
- Sem notificações para sessão do nudge pessoal (somente sessões de trabalho).
- Sem alteração retroativa se o usuário mudar as settings com uma sessão já ativa — vale na próxima sessão.

## Data Model

### `AppSettings` (adicionar dois campos)

| Campo                            | Tipo             | Default |
| -------------------------------- | ---------------- | ------- |
| `sessionReminderIntervalMinutes` | `number \| null` | `60`    |
| `sessionReminderCount`           | `number`         | `12`    |

`null` em `sessionReminderIntervalMinutes` desativa o recurso. `sessionReminderCount` é ignorado quando o recurso está desativado.

### `ActiveSession` (adicionar campo opcional)

```ts
reminderNotificationIds?: string[]
```

Armazena os IDs das notificações agendadas para a sessão corrente, permitindo cancelamento ao parar.

## Lógica de agendamento

### Ao iniciar a sessão (Home)

```
se sessionReminderIntervalMinutes != null && notificationsEnabled:
  ids = []
  para i de 1 até sessionReminderCount:
    fireAt = new Date(startedAt).getTime() + i * sessionReminderIntervalMinutes * 60_000
    se fireAt > Date.now():
      id = await scheduleSessionReminderNotification({ startedAt, fireAt })
      ids.push(id)
  salvar ActiveSession com reminderNotificationIds = ids
```

### Ao parar a sessão

```
para cada id em activeSession.reminderNotificationIds ?? []:
  await cancelReminderNotification(id)
```

### Conteúdo da notificação

- **Título**: `Sessão em andamento`
- **Corpo**: `Você tem uma sessão ativa há X hora(s). Toque para verificar.`
  - X calculado como `Math.round((fireAt - startedAtMs) / 3_600_000)`

## UI — Tela Settings

Novo grupo exibido após os grupos existentes:

**Sessão ativa**

| Opção                   | Controle        | Valores                                                                 |
| ----------------------- | --------------- | ----------------------------------------------------------------------- |
| Lembrete de sessão      | Picker          | Desativado / 30 min / 1h / 2h / 3h                                      |
| Quantidade de lembretes | Picker numérico | 1 / 2 / 3 / 6 / 12 / 24 (visível somente quando intervalo ≠ Desativado) |

## Acceptance Criteria

- Com recurso ativado: iniciar uma sessão agenda `sessionReminderCount` notificações locais nos horários corretos.
- As notificações aparecem no dispositivo no horário calculado, com o corpo indicando o tempo decorrido.
- Parar a sessão cancela todas as notificações pendentes do lote.
- Com `sessionReminderIntervalMinutes = null`: nenhuma notificação é agendada ao iniciar.
- Tela Settings exibe o grupo "Sessão ativa" com os dois pickers; o picker de quantidade fica oculto quando o intervalo é "Desativado".
- Alterações nas settings não afetam sessões já ativas — apenas a próxima sessão iniciada usa os novos valores.
- `npm run check` passa.

## Validation Commands

```bash
npm run check
```
