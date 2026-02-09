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

## Cross-Browser Gotchas

### File inputs (`<input type="file">`)

Safari handles file inputs differently from Chromium. Three approaches were tried and only one works reliably across all browsers:

1. **Transparent overlay (FAILS in Safari):** Sizing a `<input type="file">` to `width: 100%; height: 100%; opacity: 0` over a container. Safari's clickable area for file inputs doesn't match CSS dimensions — only the native "Choose File" button portion responds to clicks, even with `font-size: 200px` and `appearance: none`.

2. **`<label htmlFor>` wrapping (FAILS in Safari):** Using a `<label>` element associated with a hidden file input. Safari doesn't reliably forward clicks from child elements inside a `<label>` to the associated input.

3. **Visually hidden input + programmatic `.click()` (WORKS everywhere):** Hide the input with `clip: rect(0,0,0,0)` (NOT `display: none` — Safari blocks `.click()` on `display: none` inputs). Put an `onClick` on the visible container div that calls `inputRef.current?.click()`. Give all visual children `pointer-events: none` so clicks always land on the div. This works because the `.click()` is triggered within a user gesture.

See `AvatarUploader.tsx` for the working implementation.

### Playwright MCP vs real browsers

Playwright clicks elements by dispatching events directly to the DOM node (bypassing visual hit-testing). A component that works in Playwright may fail in a real browser if:

- The clickable element doesn't visually cover the expected area
- Another element with `pointer-events: auto` is on top
- The browser handles the element type differently (e.g., Safari file inputs)

When testing with Playwright MCP, use `page.mouse.click(x, y)` with pixel coordinates instead of element-ref clicks to better simulate real user behavior. But keep in mind even coordinate clicks may not catch all Safari-specific issues.

## Task Completion Requirements

You are not finished with your task until these commands have no errors:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
```
