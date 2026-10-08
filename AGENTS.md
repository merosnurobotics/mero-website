<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Education visualizations

- All text inside Manim and ManimML renders must be in English, including titles, node labels, legends, annotations, and footnotes. Never render Korean text inside those assets.
- Use a clean English sans-serif font consistently (Lato for the current education scenes), set it explicitly, and verify the font exists before rendering. Use readable sizes and inspect the exported PNG/video.
- Keep the surrounding educational explanations in Korean. Render diagrams horizontally when that best explains the relationship; adapt the web layout for small screens.
- Reuse external images only with verified, asset-appropriate licensing and retained attribution/notices. A rendering library's license does not grant rights to another creator's videos or images.
- Prefer compressed GIFs for short explanatory animation loops that need no audio, seeking, or playback controls. Keep video where frame inspection, synchronization, or long demonstrations need playback controls. Export a static alternative for reduced-motion users.
