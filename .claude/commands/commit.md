Run `git diff --staged` and `git status` to see what is staged.

Then write and execute a git commit that follows these rules from COMMIT_CONVENTION.md:

**Format:**
- `<type>[optional scope]: <description>`
- Type is required, description is required (lowercase, no period, imperative tense)
- Scope is optional — use to narrow area: `feat(chat):`, `fix(auth):`, `chore(deps):`
- For breaking changes: add `!` before colon (`feat!:`) or add `BREAKING CHANGE:` footer

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change that neither fixes nor adds feature
- `chore` — maintenance, deps, config
- `docs` — documentation only
- `style` — formatting, whitespace (no logic change)
- `test` — adding/updating tests
- `perf` — performance improvement
- `ci` — CI/CD changes
- `build` — build system/tooling
- `revert` — reverts a commit

**Scopes:** chat, auth, db, api, ui, pipeline, email, push, payments, deps, config

**Commit size:**
- One commit = one logical change
- If staged changes span multiple concerns, warn user and suggest splitting into separate commits

**If nothing is staged:** run `git status` and tell the user what is unstaged.

**Do not ask for confirmation — just commit.**
