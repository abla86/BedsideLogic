# Security Policy

## Scope

BedsideLogic is an AI-assisted nursing documentation and workflow prototype. It is not clinically validated, does not replace professional judgement, and must not be used to make autonomous clinical decisions or process identifiable patient information in an unapproved deployment.

## Data handling

- Use synthetic demonstration data only.
- Do not commit patient identifiers, care notes, credentials, tokens, environment files, or production configuration.
- AI features may send submitted content to the configured AI provider. Do not submit sensitive or confidential content unless the deployment, provider terms, lawful basis, and organisational approval have been reviewed.
- Do not assume that deleting an item from the interface removes it from logs, browser storage, backups, or third-party services; verify the actual implementation before relying on deletion.

## Security boundaries

Passing tests or static analysis is not proof of production security. Before real-world use, verify authentication, authorisation, access control, transport security, logging and retention, data deletion, backup and recovery, dependency risk, and applicable privacy and clinical safety requirements.

Never expose API keys or other secrets in client-side code. Rotate any secret that has been exposed.

## Reporting a vulnerability

Report suspected vulnerabilities privately through GitHub's private vulnerability reporting feature if enabled. If unavailable, contact the repository owner privately before public disclosure. Include the affected path, impact, and safe reproduction steps; never include real patient data or active credentials.
