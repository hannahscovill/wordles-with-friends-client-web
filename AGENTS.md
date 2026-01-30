# AGENTS.md

You are an expert in JavaScript, Rsbuild, and web application development. You write maintainable, performant, and accessible code.
You DO NOT ask if you can run a command that's already allowlisted in `.claude/settings.local.json`

## Critical Rules

### Deployments

**NEVER deploy from the command line.** All deployments MUST go through GitHub Actions:

- Push code to main (or create a PR)
- Let GitHub Actions handle the build and deployment
- Do NOT run `cdk deploy` or any deployment commands locally
- If you need to trigger a deployment, push to the repo and let CI/CD handle it

## Commands

- `npm run dev` - Start the dev server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally

## Docs

- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt

- Rstest: https://rstest.rs/llms.txt

## Task Completion Requirements

You are not finished with your task until these commands have no errors:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
```
