# Spec Completion Policy

## Rule

Before marking a spec as complete, run the full quality gate:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run test:coverage
```

Or in a single command:

```bash
npm run check && npm run test:coverage
```

## Coverage Threshold

The `src/lib/` coverage must remain above **80% statements**. If new business logic is added without tests and coverage drops below this threshold, write the missing tests before closing the spec.

## When This Applies

- After the last task of any spec is implemented and committed.
- After any fix or correction applied to a completed spec.

## Failures

If any check fails, the spec is not complete. Fix all errors before marking done:

- Lint errors block completion. Warnings are allowed but should be reviewed.
- Format failures must be fixed with `npm run format`.
- TypeScript errors block completion.
- Test failures block completion.
- Coverage below 80% in `src/lib/` requires additional tests.

## Note

These quality scripts (`lint`, `format:check`, `typecheck`, `test`, `test:coverage`, `check`) do not exist yet. Add them as part of the code quality tooling setup before relying on this policy.
