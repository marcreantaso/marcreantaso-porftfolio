# Marc Gian R. Reantaso — Portfolio

A dark, mathematically themed portfolio built with the Next.js App Router and exported as a static site for GitHub Pages.

**Live:** [marcreantaso.github.io/marcreantaso-porftfolio](https://marcreantaso.github.io/marcreantaso-porftfolio/)

## What is inside

- **Hero** — a lazy-loaded, pointer-reactive React Three Fiber torus knot with an SVG fallback, plus a live KaTeX calculator (function plot, derivative, Simpson integral).
- **Systems** — four case studies (PseudoPy, AgriGuard, CaDeT, WasteLink PH) with full-screen architecture modals, plus two compact repository cards.
- **Metrics** — a bento control panel covering the compiler pipeline, the ACCS × Lucky Me award, esports decision-making, and complexity classes.
- **Sandbox** — a real in-browser compiler: lexer → recursive-descent parser → positioned AST → Python emitter → loop-nesting complexity heuristic. Includes presets, token stream, line mapping, and diagnostics.
- **Timeline** — academic, esports, and competition entries, including competitive runs across Tambay League, SM Cyber League, and Smart Play. Ongoing items say “Present” rather than inventing dates.
- **Credentials** — nine verified certificates from Cisco Networking Academy, AWS, Udemy, Wadhwani Foundation, and TED-Ed, deduplicated and linked to the original files in Google Drive.
- **Contact** — validated terminal-style form that posts to Formspree when configured, otherwise opens a prefilled `mailto:` message. Includes a direct email copy button.
- **Background engine** — switchable Vector Field, Fibonacci Grid, Voronoi, and Perlin Waves canvases with a persisted preference and reduced-motion support.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| Motion | Motion (Framer Motion) 14 |
| 3D | React Three Fiber 9 + Three.js |
| Math | KaTeX, d3-delaunay |
| Icons | Lucide React + custom brand SVGs |
| Tests | Vitest 5 |

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Environment

Copy `.env.example` to `.env.local` and set only what you need:

```bash
NEXT_PUBLIC_FORMSPREE_ID=          # optional; without it the form falls back to mailto
NEXT_PUBLIC_BASE_PATH=             # e.g. /marcreantaso-porftfolio for project Pages
NEXT_PUBLIC_SITE_URL=https://marcreantaso.github.io
```

`NEXT_PUBLIC_BASE_PATH` must match `basePath` in `next.config.ts`; both read the same variable.

### Scripts

```bash
npm run dev        # development server
npm run build      # static export to out/
npm run preview    # serve out/ on port 4173, respecting NEXT_PUBLIC_BASE_PATH
npm run cv         # render documents/cv/Marc-Gian-Reantaso-CV.pdf
npm run typecheck  # tsc --noEmit
npm test           # Vitest (compiler suite)
```

## Deployment

The workflow in `.github/workflows/deploy.yml` builds and publishes `out/` to GitHub Pages on every push to `main`.

1. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Optionally add a repository secret named `NEXT_PUBLIC_FORMSPREE_ID` to enable the hosted contact relay.
3. Push to `main`. The workflow runs tests, type-checks, builds with the project base path, and deploys.

The exported site includes `public/.nojekyll`; the workflow also writes `out/.nojekyll` before upload.

### Manual export

```bash
$env:NEXT_PUBLIC_BASE_PATH="/marcreantaso-porftfolio"   # PowerShell
$env:NEXT_PUBLIC_SITE_URL="https://marcreantaso.github.io"
npm run build
npm run preview
```

Open `http://localhost:4173/marcreantaso-porftfolio/`. The preview server reads `NEXT_PUBLIC_BASE_PATH`, so keep the variable set in the same shell (or set `PORT` to use another port). For a root-hosted local build, omit `NEXT_PUBLIC_BASE_PATH` for both commands.

## Project layout

```
app/                     App Router shell, metadata, sitemap, robots
components/
  background/            Canvas renderers and mode switcher
  certifications/        Verified credential cards
  contact/               Terminal contact form + identity panel
  hero/                  Hero, R3F scene, formula widget
  layout/                Navbar, footer, render timer
  metrics/               Bento grid and SVG visuals
  projects/              Cards, modal, case-study visuals
  sandbox/               Editor, output tabs, AST view
  timeline/              Scroll-linked timeline
  ui/                    Primitives and brand icons
lib/
  compiler/              Lexer, parser, codegen, complexity, tree, tests
  data/                  Site, projects, timeline, certification content
  math/perlin.ts         Perlin noise implementation
  seo.ts                 Absolute URL helpers
public/
  legacy/                Archived 2024 static portfolio (noindexed)
  images/                Portraits
```

## Content accuracy

All figures and claims come from the repositories and confirmed results. There are no invented benchmark numbers or dates:

- PseudoPy and CaDeT link to live deployments.
- AgriGuard’s public demo is marked offline; its repository remains linked.
- The award is listed as **Champion — The Great Flavor Byte: ACCS × Lucky Me Idea Noodling Competition** for AgriGuard, without an inferred year.
- Certification dates and titles are transcribed from the certificate PDFs; every credential links to its original file in the public Google Drive folder. Duplicate “Update” copies are omitted.
- A second Drive folder holds academic honors and participation records. It is linked as supplementary evidence only — nothing in it is transcribed into a credential card or a dated claim.
- Complexity labels in the sandbox are structural heuristics, not benchmark measurements.

## Accessibility

- Skip link, landmark structure, labelled form fields, live status regions, and focus management in the project modal.
- Keyboard support: `Tab` indents in the sandbox editor, `⌘/Ctrl + Enter` returns to the output.
- `prefers-reduced-motion` disables animation loops, reveals, and canvas motion.
- The 3D scene has a static SVG fallback when WebGL is unavailable.

## Archived site

The previous static portfolio is preserved at `/legacy/` with its original styles and activity pages. PDFs and DOCX files were removed during migration. The archive is excluded from search indexing via `robots.txt`, `noindex` meta tags, and is not listed in the sitemap.

## Contact

- Email: [reantasomarcgian@gmail.com](mailto:reantasomarcgian@gmail.com)
- LinkedIn: [marc-gian-reantaso-88a3b6381](https://www.linkedin.com/in/marc-gian-reantaso-88a3b6381)
- GitHub: [github.com/marcreantaso](https://github.com/marcreantaso)
