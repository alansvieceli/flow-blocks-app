# Commit Convention

This project uses **Semantic Commits** to make the history readable and consistent.

## Format

```
<type>: <short description in imperative mood>
```

## Types

| Type       | When to use                                                      |
| ---------- | ---------------------------------------------------------------- |
| `feat`     | New feature or functionality                                     |
| `fix`      | Bug fix                                                          |
| `docs`     | Documentation changes only (specs, READMEs, standards)           |
| `test`     | Adding or modifying tests, no production code changes            |
| `build`    | Changes to build files or dependencies                           |
| `perf`     | Performance improvements                                         |
| `style`    | Formatting, semicolons, trailing spaces, lint — no logic changes |
| `refactor` | Code restructuring without behavior change                       |
| `chore`    | Build tasks, config, tooling, `.gitignore` — no production code  |
| `ci`       | Continuous integration changes                                   |
| `raw`      | Config files, data files, feature flags, parameters              |
| `cleanup`  | Removing commented-out code, dead code, unnecessary files        |
| `remove`   | Deleting obsolete files, directories, or features                |

## Examples

```
feat: add weekly planner screen
fix: resolve crash on empty block list
docs: add spec 007: habit tracker
chore: add .env to .gitignore
refactor: extract time block component
```

## Rules

- Use lowercase for the type and description.
- Description in imperative mood: "add", not "added" or "adding".
- No period at the end.
- Keep the description under 72 characters.
