# CointMU Architecture & Codebase Guidelines

## 1. Core Philosophy

This project strictly follows a Feature-Driven Architecture (Feature-Sliced Design). The goal is to maximize modularity, make the codebase highly scalable, and ensure that modifying one feature does not break another.

This is an **Electron desktop application**. All rules below assume a strict separation between the `main` process, `preload` bridge, and `renderer` process. Code that blurs this boundary (e.g. `nodeIntegration: true`, direct Node API access from the renderer) is forbidden regardless of convenience.

## 2. Directory Structure Overview

```
src/
├── main/            # Electron main process (Node context)
│   ├── ipc/          # ipcMain handlers, grouped by domain
│   ├── services/     # OS-level, filesystem, secure storage, WS server/client
│   └── main.ts       # Entry point, window lifecycle
├── preload/          # contextBridge exposure only, no business logic
│   └── preload.ts
├── renderer/         # The actual UI application (React)
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── stores/
│   ├── types/
│   └── utils/
├── shared/           # Types/constants shared between main and renderer
└── tests/            # Mirrors src/ structure (see §9)
```

> Rule: `main/` owns anything that touches the OS, filesystem, secure storage, or raw sockets. `renderer/` never does this directly — it always goes through `preload` → IPC → `main`.

## 3. The Features Architecture

Every core domain of the application (e.g., `auth`, `wallets`, `transactions`) must live inside `renderer/features/`. A feature must be treated as an isolated micro-frontend.

A standard feature folder looks like this:

```
features/auth/
├── auth.api.ts
├── auth.components.tsx
├── auth.constants.ts
├── auth.dto.ts
├── auth.hooks.ts
├── auth.schemas.ts
├── auth.types.ts
├── auth.store.ts
└── index.ts
```

**Rule of Isolation:** Features are strictly forbidden from importing components, stores, or state from other features directly. If two features need to share logic, that logic must be moved to the global directories (`src/renderer/components`, `src/renderer/hooks`, `src/renderer/utils`).

**Barrel export rule (`index.ts`):** Each feature's `index.ts` must only re-export what other features/pages are explicitly allowed to consume (typically: the main component, public hooks, and public types). Internal helpers, raw store instances, and DTOs must **not** be exported from the barrel. This is what makes the Rule of Isolation actually enforceable instead of just a convention on paper.

## 4. The "No Magic Numbers" Rule

Directly writing hardcoded numbers or static string keys inside components or logic files is strictly forbidden.

- All application-wide static values must be exported from `src/renderer/constants/` (e.g., `app.constants.ts`).
- All feature-specific static values must be exported from the feature folder using the strict naming convention (e.g., `auth.constants.ts`).
- Always use `UPPER_SNAKE_CASE` for constant variable names.
- IPC channel names and WebSocket event names count as static string keys — see §7 and §8, they must never be inlined as raw strings either.

## 5. Services and Data Transfer Objects (DTOs)

- **Services:** All external HTTP requests and WebSocket listeners must be encapsulated inside `services/` or `features/[name]/`. Components should never call `fetch`, `axios`, or `window.electron.ipcRenderer` directly — always through a service wrapper.
- **DTOs:** API/IPC responses must not be passed directly into UI components. Use DTO functions to clean, format, and map raw backend data into strict frontend interfaces before it reaches the view layer.

## 6. Security & Sensitive Data Handling

This is a wallet application. Violations in this section are treated as critical bugs, not style issues.

- **Private keys, seed phrases, and mnemonics must never enter the renderer's persistent storage.** They may only exist transiently in memory in `main`, and must be wiped from memory as soon as the operation using them completes.
- **Never log sensitive data.** No `console.log`, no error-tracking payloads, no crash reports may contain private keys, mnemonics, passwords, or raw signed transactions.
- **Encryption at rest:** any sensitive data that must persist (encrypted keystore, session tokens) is encrypted using Node's `crypto` module (AES-256-GCM) in the `main` process — never `localStorage`/`sessionStorage` in the renderer, and never plaintext on disk.
- **IPC boundary discipline:** the `preload` script exposes only a minimal, explicitly whitelisted API via `contextBridge.exposeInMainWorld`. It must never expose `ipcRenderer` wholesale (no `exposeInMainWorld('ipcRenderer', ipcRenderer)`).
- **Clipboard hygiene:** if a private key, seed phrase, or address is copied to clipboard, it must be auto-cleared after a fixed timeout (e.g. 30s), and the UI must warn the user this will happen.
- **Renderer hardening:** `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true` are mandatory on every `BrowserWindow`. Any exception must be justified in a code comment referencing this rule.

## 7. IPC Convention (Main ↔ Preload ↔ Renderer)

- Channel names follow `domain:action` format, defined as constants (e.g. `WALLET_CHANNELS.GET_BALANCE = 'wallet:get-balance'`), never inline strings.
- Every `ipcMain.handle` must have a matching typed wrapper exposed through `preload`, and a corresponding typed function in the renderer's `services/` layer. Components call the service function, never `window.electron.invoke(...)` directly.
- Request/response payloads crossing the IPC boundary must be validated (e.g. with `zod`) on the `main` side, since renderer input cannot be trusted even in a desktop app.

## 8. WebSocket Layer

Since this app connects to a paired peer (extension/relay) over WebSocket, this layer needs explicit conventions:

- **Reconnection strategy:** exponential backoff with a max retry cap; must be configurable, not hardcoded inline.
- **Event naming:** `domain:action` format, matching the IPC convention (e.g. `wallet:balance:update`), defined as constants.
- **Heartbeat:** ping/pong interval and timeout values must be defined in constants, not magic numbers.
- **Connection state:** must be exposed to the UI through a dedicated store (e.g. `connectionStore`), not inferred ad-hoc from individual feature stores.

## 9. State Management (Zustand)

- One store per feature, colocated as `[domain].store.ts` inside that feature folder. Cross-cutting state (e.g. connection status, active wallet) lives in `src/renderer/stores/`, not inside a feature.
- Stores expose actions as named functions on the store itself — components never mutate state directly.
- If a store needs persistence, use Zustand's `persist` middleware **only for non-sensitive UI state** (e.g. theme, last-opened tab). Anything touching wallet data must go through the `main`-process encrypted storage in §6, never Zustand `persist` to `localStorage`.

## 10. Error Handling

- Define custom error classes per domain (e.g. `WalletError`, `IpcError`) instead of throwing raw strings or generic `Error`.
- Errors crossing the IPC boundary must be serialized into a consistent shape (`{ code, message }`) — never leak raw Node error objects or stack traces to the renderer.
- UI-facing error messages are mapped from error codes in a single place per feature (e.g. `auth.errors.ts`), not scattered inline across components.

## 11. i18n / Locale Convention

- Translation keys follow `domain.key` dot notation (e.g. `wallet.balance.label`), matching the feature naming convention.
- No hardcoded user-facing strings in components — always resolved through the locale layer.
- New keys must be added to all supported locale files in the same change; a missing key in any locale is a build-blocking issue, not a warning.

## 12. Testing (forward-looking convention)

Testing isn't set up yet, but new code should already follow this convention so adoption later doesn't require a rewrite:

- Framework: **Vitest** (fastest fit for a Vite/TS/Zustand stack; swap this line if the project ends up using something else).
- File naming mirrors the source file: `auth.store.ts` → `auth.store.test.ts`, colocated next to the file it tests.
- Priority order once testing starts: (1) `main` process IPC handlers and encryption/storage logic — highest risk, (2) Zustand stores, (3) DTO mapping functions, (4) components — lowest priority, UI can be covered last.
- No formal coverage % requirement yet; the rule for now is "critical wallet logic and IPC handlers are not merged without a test."

## 13. Coding Standards & Conventions

- **Language:** TypeScript is mandatory. `any` types are strictly forbidden unless interacting with untyped legacy external libraries.
- **Imports:** Use ES6 modules. Prefer absolute imports (e.g., `@/components/...`) over relative paths (`../../components/...`).
- **Documentation:** Use standard English JSDoc formatting strictly at the function, interface, or class level. Inline commenting should be avoided; write self-documenting code instead.
- **File Naming:** Strictly use the dot-notation pattern `[domain].[type].ts` or `[domain].[type].tsx`.
  - Allowed examples: `auth.constants.ts`, `user.store.ts`, `wallet.api.ts`, `button.component.tsx`.
  - Forbidden examples: `auth-constants.ts`, `AuthConstants.ts`, `constants.ts`.
- **Variable/Function Naming:** camelCase.
- **Class/Interface Naming:** PascalCase.
- **Linting/Formatting:** ESLint + Prettier config in the repo root is the source of truth; agent-generated code must conform to it, not introduce a different style.
