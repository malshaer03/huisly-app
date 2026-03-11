Run `git diff --staged` and `git status` to see what is staged.

Then write and execute a git commit that follows these rules from COMMIT_CONVENTION.md:

1. Format: `<type>[optional scope]: <description>`
2. Types: feat, fix, refactor, chore, docs, style, test, perf, ci, build, revert
3. Scopes: chat, auth, db, api, ui, pipeline, email, push, payments, deps, config
4. Description: lowercase, no period, imperative tense ("add" not "adds" or "added")
5. Keep it small and goal-oriented — if staged changes span multiple concerns, warn the user and suggest splitting

If nothing is staged, run `git status` and tell the user what is unstaged.

Do not ask for confirmation — just commit.
