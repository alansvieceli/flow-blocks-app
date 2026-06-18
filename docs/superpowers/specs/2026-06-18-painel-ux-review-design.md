# Design — Revisão UX do Painel

Data: 2026-06-18

## Objetivo

Tornar a aba Painel mais compreensível removendo seções confusas e ajustando nomenclatura e visual da seção semanal.

---

## Decisões

### Seções removidas

| Seção                  | Motivo                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trocas de Contexto** | Números sem referência — não há escala, meta ou benchmark. O usuário não sabe interpretar o valor.                                          |
| **Alertas de Equipe**  | Só aparece quando há alerta (layout instável). A informação já está duplicada na seção de equipes. O usuário não usa metas de % por equipe. |

### Seções sem mudança

- Mapa de Calor (incluindo filtros de equipe/categoria por chips roláveis)
- Sequência
- Hoje
- Aproveitamento
- Atividades Pessoais

### Seção "Esta Semana" — revisada

#### Card de categorias

Mudanças:

1. **Adicionar "Total registrado"** em destaque no topo do card, antes das barras de categoria.
2. **Renomear "Interrupções" → "Reuniões"** (nome mais direto para as categorias não-foco).
3. **Renomear "Ocioso" → "Sem sessão"** e aplicar cor discreta (`colors.textDisabled` / `#2a2a4a`) na label, barra e valor — deixando claro que é tempo sem registro, não uma categoria ativa.
4. A barra de "Sem sessão" não deve usar `colors.accentFrom` (roxo). Usar `colors.textDisabled`.

Resultado visual:

```
┌─────────────────────────────────┐
│ Total registrado         11h 00m│
│─────────────────────────────────│
│ ⚡ Foco       ████████░░  6h 20m│
│ 🗓 Reuniões   ███░░░░░░░  2h 40m│
│ ⬜ Sem sessão  ██░░░░░░░  2h 00m│  ← cinza
└─────────────────────────────────┘
```

#### Card de equipes

Mudança:

- Mostrar `%  · Xh Ym` no valor de cada equipe (manter percentual junto com o tempo absoluto).

Resultado visual:

```
┌─────────────────────────────────┐
│ Equipe A      █████████  58% · 6h 20m│
│ Equipe B      ██████░░░  42% · 4h 40m│
└─────────────────────────────────┘
```

---

## Escopo de implementação

- Remover `ExtrasSection` → bloco "TROCAS DE CONTEXTO" (`contextSwitches`) e bloco "ALERTAS DE EQUIPE" (`alerts`).
- Em `WeeklySection`:
  - Adicionar linha de total (`categoryMetrics.totalMinutes`) no topo do primeiro card.
  - Renomear label "Interrupções" → "Reuniões".
  - Renomear label "Ocioso" → "Sem sessão" e mudar a cor da barra para `colors.textDisabled` e as cores de texto para `colors.textDisabled`.
  - No card de equipes, alterar `metricValue` para mostrar `{tm.percentage}% · {formatMinutes(tm.minutes)}` (já era assim — confirmar que continua).
- Remover imports não usados após as remoções (`getContextSwitches`, `getTeamBalanceAlerts`).

## Fora do escopo

- Filtros do heatmap (chips roláveis ficam como estão).
- Qualquer mudança nas outras seções.
- Metas de % por equipe e alertas (funcionalidade existe no código, apenas não é exibida no Painel).
