# Contributing to CointMU Desktop Client

Thanks for your interest in contributing! This guide explains how to propose changes and keep the project stable.

## Getting Started
- Fork the repository and create a feature branch from your fork.
- Follow the setup steps in the README, including placing the `geth` binary in `resources/bin/`.
- Keep your changes focused and scoped to a single improvement.

## Development Workflow
- Use the Makefile targets (`make dev`, `make build:win`) or the npm scripts.
- Run `npm run build` before opening a PR to ensure the app still builds.

## Code Style
- Use TypeScript and React patterns already present in the codebase.
- Keep components and utilities small, with clear names.
- Avoid adding dependencies unless they are necessary for the change.

## Submitting Changes
- Describe the problem, the solution, and any tradeoffs in your PR.
- Include screenshots or logs for UI or workflow changes when relevant.
- Ensure your branch is up to date before requesting review.

## Reporting Issues
- Provide steps to reproduce, expected behavior, and actual behavior.
- Include environment details (OS, Node.js version, app version).
