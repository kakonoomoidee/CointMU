# CointMU Desktop Client

CointMU Desktop Client is a robust Proof of Work blockchain node bundled within a secure and high-performance Electron application. It provides users with an integrated dashboard for monitoring node metrics, controlling the miner, and interacting with the CointMU network seamlessly.

## Quick Start

### Prerequisites
- Node.js (v22 or higher recommended)
- npm or yarn
- Git

### Installation
1. Clone the repository and navigate to the project directory.
2. Ensure you have the `geth` binary placed in the `resources/bin/` directory.
3. Configure your environment variables in `.env` based on `.env.example`.
4. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

### Using the Makefile
We provide a professional build system via `Makefile` to streamline development tasks. The available commands are:

- `make dev`: Starts the development server with hot-module reloading for both the main process and the React renderer.
- `make build:win`: Compiles the application and packages it as a Windows executable.
- `make clean`: Removes all build artifacts, including `out`, `dist`, and `build` directories to ensure a fresh compilation state.
- `make help` (default): Displays the list of available commands.

### Release Workflow
Releasing a new version is fully automated using our custom bump-version script. This script synchronizes the version string across both `package.json` and the `Makefile`, installs dependencies, creates a versioned git commit, applies an annotated git tag, and pushes the updates to the remote repository.

**Usage:**
```bash
node scripts/bump-version.js <major|minor|patch> [prerelease-tag]
```

**Examples:**
- Bump the minor version (e.g., from 1.1.0 to 1.2.0):
  ```bash
  node scripts/bump-version.js minor
  ```
- Bump the patch version with a prerelease tag (e.g., to 1.1.1-beta):
  ```bash
  node scripts/bump-version.js patch beta
  ```
