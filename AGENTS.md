<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Conventions (`silid-one`)

- **Package manager:** Always use `bun` (`bun install`, `bun add`, `bun run ...`) instead of `npm` or `npx`. Keep `bun.lock` and never commit `package-lock.json`.
- **Atomic Design structure:** Place UI building blocks strictly under `components/atoms/`, `components/molecules/`, `components/organisms/`, and `components/templates/`. Keep `app/**/page.tsx` thin by rendering templates.
- **Visual direction & palette:** Preserve Silid's current light color scheme (`#fafafa` page, `#ffffff` cards, `#171717` ink, and Silid ember-orange `#ea580c` / `#c2410c` accent) without decorative blur blobs, gradient text, heavy `font-extrabold`/`font-black` weights, or looping spinners.
- **UI-first scoping:** Unless backend/API integration is explicitly requested, build interactive flows cleanly with typed state and mock data in `types/` and `data/`.
