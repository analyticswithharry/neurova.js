# `neurova` Meta Package and Versioning

## `neurova`

The `neurova` package re-exports major stack modules:

- `core`
- `ai`
- `backend`
- `ui`
- `runtime`

This is excellent for discovery and quick starts.

For production tree-shaking, prefer subpath imports when possible.

## Versioning strategy

Most packages are versioned together (e.g. `2.2.2` in your current release set), making compatibility easier for users.

Recommendation:
- Keep changelog entries clear per package.
- Call out major cross-package API changes in release notes.
