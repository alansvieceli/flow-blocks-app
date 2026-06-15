# Task 002-02 - Configure Lint, Format, and Test

## Plan Reference

`docs/plans/002-code-quality-tooling-plan.md`

## Status

Done

## Description

Add configuration files:

- `eslint.config.js` (Expo flat config + Prettier + TypeScript + React Hooks + React Native rules)
- `.prettierrc` and `.prettierignore`
- `jest.config.js` (`jest-expo` preset, coverage from `src/lib`, `src/storage`, `src/types`, 80% threshold)
- `jest.setup.ts` (React Native Testing Library setup)
- `tsconfig.json` updated with `noEmit`, `strict`, `types: ["jest"]`

Add a minimal `src/lib/example.ts` module with `src/lib/example.test.ts` to exercise the toolchain.

## Result

All config files created and `npx tsc --noEmit`, `npx eslint .`, `npx jest --coverage` pass.
