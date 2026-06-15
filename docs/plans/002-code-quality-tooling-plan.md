# Plan 002 - Code Quality Tooling

## Spec Reference

`docs/specs/002-code-quality-tooling.md`

## Objective

Install and configure ESLint, Prettier, Jest/RNTL, Husky, and lint-staged matching the standard project pattern, and add the related npm scripts.

## Tasks

| #   | File                                              | Description                                                                       |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | `docs/tasks/002-01-add-quality-dependencies.md`   | Install ESLint, Prettier, Jest/RNTL, Husky, lint-staged deps                      |
| 2   | `docs/tasks/002-02-configure-lint-format-test.md` | Add eslint.config.js, .prettierrc, .prettierignore, jest.config.js, jest.setup.ts |
| 3   | `docs/tasks/002-03-add-npm-scripts-and-hooks.md`  | Add npm scripts, lint-staged config, husky pre-commit hook                        |
| 4   | `docs/tasks/002-04-validate.md`                   | Run `npm run check` and confirm it passes                                         |

## Validation

```bash
npm run check
```

## Out of Scope

- Product features
- CI configuration
