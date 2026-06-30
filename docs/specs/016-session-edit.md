# Spec 016 - Edição de Sessão no Histórico

## Objective

Permitir que o usuário corrija o horário de início e término de uma sessão passada diretamente na tela Histórico.

## Context

Spec 003 excluiu edição de sessões como non-goal inicial. Com o uso real do app, surgiu a necessidade pontual de corrigir horários errados — especialmente quando o usuário esqueceu de parar o timer ou iniciou tarde. Somente início e término são editáveis; os demais campos (categoria, equipe, nota) ficam fora do escopo desta spec.

## Goals

- **Acesso via Histórico**: cada linha de sessão no Histórico exibe um ícone de editar que navega para a tela de edição.
- **Editar início e término**: time pickers para `startedAt` e `endedAt`; a data é exibida mas não editável nesta tela.
- **Duração recalculada**: `durationSeconds` é recalculado automaticamente a partir dos dois horários ao salvar.
- **Validação**: `endedAt` deve ser posterior a `startedAt` com diferença mínima de 1 minuto; botão Salvar desabilitado enquanto inválido.
- **Após salvar**: atualiza a sessão no storage e retorna ao Histórico.

## Non-goals

- Sem edição de categoria, equipe ou nota nesta spec.
- Sem edição da data (somente do horário).
- Sem validação de sobreposição com outras sessões.
- Sem exclusão de sessão nesta tela.

## UI — Tela `/session-edit`

Rota parametrizada: `router.push('/session-edit?id=<sessionId>')`.

### Campos

| Campo   | Tipo                  | Detalhe                                      |
| ------- | --------------------- | -------------------------------------------- |
| Data    | Texto somente leitura | Exibe a data da sessão no formato DD/MM/AAAA |
| Início  | Time picker nativo    | Pré-preenchido com `startedAt`               |
| Término | Time picker nativo    | Pré-preenchido com `endedAt`                 |
| Duração | Texto calculado       | Atualiza em tempo real: ex. `1h 20m`         |

### Validação para habilitar o botão Salvar

- `endedAt` > `startedAt`
- Diferença >= 60 segundos

### Comportamento ao salvar

```
durationSeconds = Math.floor((endedAt - startedAt) / 1000)
session.startedAt = novo startedAt ISO
session.endedAt   = novo endedAt ISO
session.durationSeconds = durationSeconds
persistir via updateSessions
```

## Acesso na tela Histórico

Cada linha de sessão exibe um ícone de lápis (`✏️` ou `Ionicons pencil`) à direita. Ao tocar, navega para `/session-edit?id=<sessionId>`.

## Acceptance Criteria

- Ícone de editar aparece em cada linha do Histórico e navega para `/session-edit` com o ID correto.
- A tela exibe a data da sessão (somente leitura) e time pickers pré-preenchidos com os horários originais.
- A duração calculada atualiza em tempo real ao alterar início ou término.
- Botão Salvar desabilitado se `endedAt <= startedAt` ou diferença < 60s.
- Ao salvar, a sessão é atualizada no storage; o Histórico e as métricas do Painel refletem os novos valores.
- `npm run check` passa.

## Validation Commands

```bash
npm run check
```
