# CV

Print-ready curriculum vitae for Marc Gian R. Reantaso.

| File | Purpose |
| --- | --- |
| `cv.html` | Source of truth. Self-contained HTML with print CSS (A4, 15 mm side margins) and the portrait pulled from `public/images/portrait.jpg`. |
| `Marc-Gian-Reantaso-CV.pdf` | Generated, 2 pages A4, selectable text, clickable links, embedded fonts. |
| `preview.png` | Full-document render, git-ignored. Regenerated on every build. |

## Regenerate

```bash
npm run cv
```

The script drives the locally installed Edge (or Chrome, or `BROWSER_PATH`) through
the DevTools protocol, so there is nothing to install. It prints the page count, page
box, flow height, link and image counts, and the block each page break falls before.

The run fails when the document is not exactly two pages, when a block is taller than
one page and would be split, when text overflows horizontally, or when a label in the
skills column no longer fits.

## Editing

- Content lives in `cv.html`. Keep it consistent with `lib/data/*` so the CV and the
  portfolio never disagree.
- One column, black on white, no icon-only information: it has to survive an ATS parse.
- Anything that must not be split across a page carries `break-inside: avoid`
  (`.entry`, `.cert-group`, `p`, `li`, `h2`).
- Re-run `npm run cv` after edits and check the reported page breaks.
