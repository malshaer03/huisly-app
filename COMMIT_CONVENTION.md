# Commit Message Convention

All commits in this repository **must** follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

---

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

---

## Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Maintenance tasks, dependency updates, config changes |
| `docs` | Documentation only changes |
| `style` | Formatting, whitespace — no logic change |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |
| `build` | Build system or tooling changes |
| `revert` | Reverts a previous commit |

---

## Rules

- Type is **required**
- Description is **required** — immediately after the colon and space
- Description is **lowercase**, no period at the end
- Scope is **optional** — use it to narrow the area of change: `feat(chat):`, `fix(auth):`, `chore(deps):`
- Body is optional — use it to explain *why*, not *what*
- Breaking changes: add `!` before the colon (`feat!:`) or add a `BREAKING CHANGE:` footer

---

## Examples

```
feat(chat): add streaming response from claude api
fix(auth): redirect to login when session expires
chore(deps): upgrade drizzle-orm to 0.45.1
refactor(db): extract query helpers into lib/db
docs: update env var naming in readme
feat!: change listing schema — removes poster_email field
```

---

## Commit Size

- **One commit = one logical change.** Never bundle unrelated changes.
- If a task touches multiple concerns (e.g. schema + UI), split into separate commits.
- Prefer many small commits over one large one.
- A good commit can be understood in isolation — what changed and why.

---

## Scopes used in this project

| Scope | Area |
|-------|------|
| `chat` | Chat UI, streaming, message handling |
| `auth` | Supabase Auth, session, login flow |
| `db` | Drizzle schema, migrations, queries |
| `api` | Next.js API routes |
| `ui` | UI components |
| `pipeline` | Workers, cron, Apify, Ollama |
| `email` | Managed email send, Postmark/SendGrid |
| `push` | Web Push notifications |
| `payments` | Stripe integration |
| `deps` | Dependency updates |
| `config` | Config files, env vars, tooling |
