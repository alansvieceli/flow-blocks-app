# Prompt — Padronização de Tipografia (para Codex)

Cole este prompt diretamente no Codex.

---

## Tarefa: Padronizar tipografia em todo o app Flow Blocks

### Contexto

App React Native Expo com TypeScript. Tela de dashboard (`app/(tabs)/dashboard.tsx`) usa um estilo de tipografia coerente na seção "Aproveitamento" que queremos usar como base para todo o app.

O app hoje tem 12 tamanhos de fonte diferentes sem escala definida (7, 9, 10, 11, 12, 13, 14, 15, 16, 20, 22, 28px). O objetivo é consolidar para uma escala de 5 níveis.

### Escala proposta

| Nível         | Tamanho                            | Uso                                               | Token                                 |
| ------------- | ---------------------------------- | ------------------------------------------------- | ------------------------------------- |
| Section label | 9px uppercase letter-spacing:1     | Labels de seção ALL CAPS                          | `typography.sectionLabel` (já existe) |
| Secundário    | 11px                               | Unidades, timestamps, info discreta               | — (manter literal)                    |
| Corpo / label | 13px                               | Labels de linhas, corpo de texto, nomes em listas | `typography.rowLabel` (criar)         |
| Métrica       | 16px weight 800                    | Valores numéricos de destaque                     | `typography.metricMedium` (já existe) |
| Título        | 18px weight 800 letterSpacing -0.5 | Títulos de tela                                   | `typography.screenTitle` (já existe)  |

### Arquivo de tokens: `src/theme/typography.ts`

Conteúdo atual:

```ts
import { TextStyle } from 'react-native';

export const typography = {
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  } satisfies TextStyle,
  sectionLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
  } satisfies TextStyle,
  body: {
    fontSize: 12,
  } satisfies TextStyle,
  metricLarge: {
    fontSize: 44,
    fontWeight: '800',
  } satisfies TextStyle,
  metricMedium: {
    fontSize: 16,
    fontWeight: '800',
  } satisfies TextStyle,
} as const;
```

**Adicionar o token `rowLabel`:**

```ts
rowLabel: {
  fontSize: 13,
} satisfies TextStyle,
```

### Mapeamento de tamanhos

Aplicar as seguintes conversões em todos os arquivos `.tsx` em `app/` e `src/components/`:

| fontSize atual                         | → novo                                                                                                        | Observações                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `fontSize: 12`                         | `...typography.rowLabel` ou `...typography.body` → **`fontSize: 13`**                                         | Labels, corpo, nomes. Usar `...typography.rowLabel` quando possível |
| `fontSize: 14`                         | `fontSize: 13`                                                                                                | Itens de lista, campos de form — consolidar para 13                 |
| `fontSize: 15`                         | Avaliar contexto: se é valor numérico → `...typography.metricMedium` (16px bold); se é texto → `fontSize: 13` |                                                                     |
| `fontSize: 10`                         | `fontSize: 11`                                                                                                | Arredondar para o nível secundário                                  |
| `fontSize: 11`                         | manter `fontSize: 11`                                                                                         | Nível secundário — não mexer                                        |
| `fontSize: 13`                         | manter — já correto                                                                                           |                                                                     |
| `fontSize: 16` com `fontWeight: '800'` | `...typography.metricMedium`                                                                                  | Usar token quando o bold já está presente                           |
| `fontSize: 16` sem bold                | `fontSize: 13`                                                                                                | Provavelmente era label, não métrica                                |
| `fontSize: 20`, `fontSize: 22`         | manter — contextos especiais (totais, streak)                                                                 | Não alterar                                                         |
| `fontSize: 28`                         | manter                                                                                                        |                                                                     |
| `fontSize: 7`                          | manter — heatmap, contexto especial                                                                           |                                                                     |
| `fontSize: 9`                          | usar `...typography.sectionLabel` se for seção label ALL CAPS                                                 |                                                                     |

### Arquivos a tocar

- `src/theme/typography.ts` — adicionar `rowLabel`
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/reminders.tsx`
- `app/(tabs)/more.tsx`
- `app/history.tsx`
- `app/teams.tsx`
- `app/categories.tsx`
- `app/settings.tsx`
- `app/reminder-form.tsx`
- `app/activities.tsx`
- `app/weekly-template.tsx`
- `app/day-plan.tsx`
- `app/nudge-form.tsx`
- `app/manual-entry.tsx`
- `src/components/ScreenHeader.tsx`
- `src/components/AppHeader.tsx`
- `src/components/common/ListRow.tsx`
- `src/components/common/OptionPicker.tsx`
- `src/components/reminders/ReminderForm.tsx`

### Regras importantes

1. **Não alterar** `fontSize` dentro do heatmap (células 7px, labels de hora) — são contextos visuais especiais com espaço apertado
2. **Não alterar** tamanhos de ícones (`size={...}` em Ionicons) — apenas `fontSize` em Text
3. **Não alterar** números hero: streak (36px), timer cronômetro (44px)
4. **Não alterar** `fontSize: 9` do `sectionLabel` — já correto
5. Quando aplicar `...typography.rowLabel`, remover o `fontSize` literal correspondente do objeto de estilo
6. Manter `color` e outros estilos — apenas `fontSize` (e `fontWeight` quando aplicável) mudam

### Validação

```bash
npm run check
```

Esperado: sem erros de TypeScript, lint, ou formatação. 117 testes passando.

### Commit

```bash
git add -A
git commit -m "style: standardize typography to 5-level scale across app"
```
