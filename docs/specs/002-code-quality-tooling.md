# Spec 002 - Code Quality Tooling

## Objective

Add the standard code quality tooling to `flow-blocks-app`: ESLint, Prettier, strict TypeScript, Jest with `jest-expo` and React Native Testing Library, Husky pre-commit hooks, lint-staged, and a duplication check script.

## Context

The project was bootstrapped with the blank Expo TypeScript template (spec 001) but had no linting, formatting, or testing tooling configured.

## Goals

- Configure ESLint using `eslint-config-expo` plus Prettier, TypeScript, React Hooks, and React Native plugin rules.
- Configure Prettier with project formatting rules and an ignore list.
- Configure Jest with the `jest-expo` preset and React Native Testing Library.
- Add a coverage threshold of 80% for `src/lib`, `src/storage`, and `src/types`.
- Add Husky pre-commit hook running `lint-staged`.
- Add `lint-staged` config to format and lint staged files.
- Add an `npm run dup` script for `jscpd` duplication checks.
- Add `npm run check` as the combined quality gate.
- Add a minimal `src/lib` module with a unit test so the toolchain is exercised.

## Non-goals

- Do not implement product features.
- Do not enforce duplication checks in CI yet.

## Acceptance Criteria

- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run typecheck` passes.
- `npm run test:coverage` passes with `src/lib` at 100% (only the placeholder module exists).
- `.husky/pre-commit` runs `npx lint-staged`.

## Validation Commands

```bash
npm run check
```
