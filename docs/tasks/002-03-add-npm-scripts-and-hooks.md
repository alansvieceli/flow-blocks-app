# Task 002-03 - Add npm Scripts and Hooks

## Plan Reference

`docs/plans/002-code-quality-tooling-plan.md`

## Status

Done

## Description

Add npm scripts: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `dup`, `test`, `test:watch`, `test:coverage`, `check`, `prepare`. Update `android`/`ios` scripts to `expo run:android` / `expo run:ios`.

Add `lint-staged` config for `*.{js,jsx,ts,tsx}` (prettier + eslint --fix) and `*.{json,md}` (prettier).

Run `npx husky init` and set `.husky/pre-commit` to `npx lint-staged`.

## Result

`package.json` updated with scripts and `lint-staged` config. `.husky/pre-commit` runs `npx lint-staged`.
