# BedsideLogic

AI-assisted nursing documentation and clinical workflow prototype with privacy-oriented input handling and Norwegian clinical terminology.

## What it demonstrates

- React + TypeScript + Vite
- Component-based frontend architecture
- Interactive workflow views
- Environment-based configuration
- Server-side Express/TypeScript integration
- Privacy and security boundaries appropriate to a portfolio prototype

## Scope

The application is a documentation-support prototype. It does not diagnose, prescribe, or replace professional clinical judgement. Never enter identifiable patient information into an unapproved deployment.

The repository is intended as inspectable engineering portfolio evidence. Claims about clinical effectiveness, regulatory compliance or production deployment are deliberately outside the project scope.

## Local development

Requirements:

- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

For features requiring an AI API, create a local `.env` file using the variables documented in `.env.example`. Never commit secrets.

Start the application:

```bash
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

GitHub Actions runs the TypeScript and production-build checks on pushes and pull requests.

## Data protection

Use synthetic demonstration data only. Do not place patient names, national identity numbers, addresses, phone numbers, journal content, credentials or other confidential information in the repository or an unapproved deployment.

## License

Apache License 2.0. See [LICENSE](LICENSE).
