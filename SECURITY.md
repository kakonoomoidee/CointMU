# Security Policy

The CointMU Desktop Client bundles a local blockchain node and manages wallet key
material on the user's machine. Because of this, we take security reports seriously and
ask that you disclose potential vulnerabilities responsibly.

## Supported Versions

Security fixes are provided for the latest released `1.x` version. Please ensure you are
running the most recent release before reporting an issue.

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues, pull
requests, or discussions.

Instead, use one of the following private channels:

- Open a private advisory through GitHub Security Advisories on the repository
  (Security tab, "Report a vulnerability").
- Email the maintainers at security@cointmu.org with a detailed description.

Please include the following when possible:

- A clear description of the vulnerability and its impact.
- Step-by-step instructions to reproduce the issue.
- The affected version, operating system, and node version.
- Any relevant logs, proof-of-concept code, or screenshots.

We aim to acknowledge reports within 72 hours and to provide a remediation timeline after
triage. We will coordinate a disclosure date with you once a fix is available.

## Sensitive Areas

The following components are especially security sensitive. Reports concerning them are
highly valued:

- Wallet key handling: mnemonic and private-key derivation, encryption of the stored
  payload (scrypt plus AES-256-GCM), and the in-memory session password.
- Inter-process communication: the preload bridge and the IPC handlers that expose
  wallet, settings, mining, and node operations to the renderer.
- Local node management: the spawning, configuration, and RPC exposure of the bundled
  Core-geth process, including the dynamically allocated RPC port.
- Transaction signing: construction and local signing of transactions before broadcast.

## Best Practices for Reporters

- Never share real seed phrases, private keys, or passwords in a report. Use test
  accounts and clearly marked dummy values.
- Test against a local development network rather than any production network.
- Avoid actions that could degrade service for other users or exfiltrate real user data.

Thank you for helping keep CointMU and its users safe.
