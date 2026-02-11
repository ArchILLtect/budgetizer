# Legacy / backward-compat stance (when users exist)

Use this section when the app has real users and you need to preserve backward compatibility.

To enable legacy-mode guidance:
- Copy the section below into `.github/copilot-instructions.md` (or merge it into that file), and
- Delete the “no legacy” section currently in `.github/copilot-instructions.md`.

## Legacy / backward-compat stance (when users exist)

- Assume real users have existing data and settings; avoid breaking changes by default.
- When changing persisted store shapes/keys, include a migration plan (and migrations where appropriate).
- Preserve public surfaces where feasible (routes, storage keys, GraphQL input shapes), or provide shims with deprecation notes.
- Prefer additive changes; if removing/renaming, update docs and include a rollback plan.
