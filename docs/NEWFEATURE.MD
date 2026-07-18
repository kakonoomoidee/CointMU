# Canonical FSD Feature Creation Guide

This document is the scaffolding guide for any new feature within `src/renderer/src/features/`. It is a companion to `ARCHITECTURE.md` — every rule here must stay consistent with it. If the two ever conflict, `ARCHITECTURE.md` wins.

## 1. Directory Structure

Every new feature MUST strictly follow this exact segment structure. Legacy directory names such as `components`, `hooks`, `services`, `utils`, or `modals` are forbidden.

```text
features/feature-name/
├── ui/         # All React components and views (.tsx)
├── model/      # Zustand stores and local type/interface definitions (.ts)
├── api/        # API calls, IPC handlers, and network requests (.ts)
├── lib/        # Hooks and pure utility functions specific to this feature (.ts)
├── config/     # Constants and configurations (.ts)
└── index.ts    # Strict Public API barrel file
```

## 2. Segment Rules

- **`ui`** — purely view logic and layout. Components must not contain raw `fetch` or `ipcRenderer` calls.
- **`model`** — manages state using Zustand and defines local type/interface definitions. (Not to be confused with the `entities` layer — `model` here is state and types _local to this feature_, not a shared business entity.)
- **`api`** — handles all external data fetching and IPC boundary communication for this feature.
- **`lib`** — houses hooks and data transformers scoped only to this feature.
- **`config`** — static values for this feature. Avoid magic strings/numbers in `ui`.

## 3. File Naming

Follows `ARCHITECTURE.md` §15: name files by **responsibility**, not by repeating the feature name — the `features/feature-name/` folder already provides that context.

| Segment   | Example                                                  |
| --------- | -------------------------------------------------------- |
| `ui/`     | `SendTokenForm.tsx` (PascalCase, matches component name) |
| `model/`  | `store.ts`, `types.ts`                                   |
| `api/`    | `sendTokenApi.ts` (camelCase)                            |
| `lib/`    | `useSendTokenValidation.ts`, `formatAmount.ts`           |
| `config/` | `constants.ts`                                           |

If a segment has multiple files of the same kind, disambiguate by purpose, not by domain: `model/sessionStore.ts` + `model/draftStore.ts`, not `feature-name.store.ts` + `feature-name.store2.ts`. No special suffixes like `.hook.ts`, `.util.ts`, or `.component.ts` — the segment folder already tells you what the file is.

## 4. The Public API Rule (`index.ts`)

`index.ts` is the strict boundary of the feature. Only export what `widgets` or `pages` actually need to consume — everything else stays private.

Use **named exports only**. Never use `export *` — a wildcard re-export silently exposes anything added to a file later, defeating the point of a strict boundary.

```typescript
/**
 * Public API for the send-token feature.
 * Exposes only the necessary integration points for external layers.
 */
export { SendTokenForm } from "./ui/SendTokenForm";
export { useSendTokenStore } from "./model/store";
```

## 5. Import Path Constraints

- **Within the same feature (between its own segments):** always use relative paths.

  ```typescript
  import { CONSTANT } from "../config/constants";
  ```

- **Importing from `entities` or `shared`:** allowed, but only through that slice's Public API barrel — never a deep import into its internal segments.

  ```typescript
  // Correct
  import { Token } from "@/entities/token";

  // Forbidden — reaches into another slice's internals
  import { Token } from "@/entities/token/model/types";
  ```

- **Importing from another `features` slice: forbidden, with no exception — not directly, not through its barrel.** Per `ARCHITECTURE.md` §3, `features` may only import from `entities` and `shared`. If `send-token` needs something from `connect-wallet`, that's a signal the shared piece belongs in `entities` or `shared`, or that the two features need to be composed together one layer up, in a `widget` or `page` — not imported into each other.

## 6. General Style

- Single quotes for all string literals, consistent with the rest of the codebase (see `ARCHITECTURE.md` §15 for the full style/lint reference).
