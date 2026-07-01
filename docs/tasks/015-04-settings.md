# Task 015-04 - Settings Screen

## Plan Reference

`docs/plans/015-session-reminder-plan.md`

## Status

Done

## Description

Adicionar grupo "SESSÃO ATIVA" na tela de Configurações com dois pickers.

## Files Changed

- `app/settings.tsx`
  - Constantes `SESSION_REMINDER_INTERVAL_OPTIONS` e `SESSION_REMINDER_COUNT_OPTIONS` adicionadas
  - Novo grupo "SESSÃO ATIVA" com `OptionPicker` de intervalo (Desativado / 30 min / 1h / 2h / 3h) e `OptionPicker` de quantidade (1 / 2 / 3 / 6 / 12 / 24), este último visível somente quando intervalo ≠ Desativado

## Validation

`npm run check` passou.
