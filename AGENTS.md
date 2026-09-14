# Agent guidelines

Personal site for Youngjae Kim. Jekyll, with the `al_folio_core` gem as the
**theme runtime only** — every layout, include and stylesheet that actually
renders is local and overrides the gem.

> This repo was created from the al-folio starter template. If you find guidance
> anywhere claiming that `_layouts/`, `_includes/` or `_sass/` must not exist
> here, it is inherited from the upstream **starter** repo and does not apply.
> A site built from the template is explicitly allowed to shadow gem files, and
> this one does so by design.

## Route your change

| Change                                        | Goes in                              |
| --------------------------------------------- | ------------------------------------ |
| Headline, lede, contact copy on the home page | `_pages/home.html` front matter      |
| A job, its bullets, or its tech tags          | `_data/experience.yml`               |
| Filter chips above the timeline               | `_data/filters.yml`                  |
| Toolkit lists                                 | `_data/stack.yml`                    |
| Nav links and command-palette entries         | `_data/nav.yml`                      |
| A case study                                  | `_work/<slug>.md`                    |
| A blog post                                   | `_posts/YYYY-MM-DD-<slug>.md`        |
| Colors, type scale, spacing, radii            | `_sass/_tokens.scss` — **only here** |
| Component styling                             | the matching `_sass/_*.scss` partial |
| Page structure                                | `_layouts/*.liquid`                  |
| Any interaction                               | `assets/js/site.js`                  |
| An icon                                       | `_includes/icon.liquid`              |

## Non-negotiables

1. **Tokens are the only place colors are defined.** No hex values in component
   partials. Both `:root` (dark) and `[data-theme="light"]` must define every
   token — a token defined in one theme only is a bug.
2. **WCAG AA or better.** Every text/background pair must be ≥ 4.5:1 in _both_
   themes. `--text-subtle` and the `--code-*` tokens are the ones that drift.
3. **JS is progressive enhancement.** The page must render, navigate and read
   correctly if `assets/js/site.js` never loads. Reveal animations are armed by
   an inline script in `head.liquid` that disarms itself after 2s for exactly
   this reason — do not make content depend on JS to become visible.
4. **No new network requests.** No icon fonts, no CDN scripts, no Google Fonts.
   Icons are inline SVG; the one font file is self-hosted and preloaded.
5. **No JS build step.** No bundler, no Tailwind pipeline. `package.json` is
   Prettier only.
6. **Do not invent facts.** Résumé content, metrics and project details are the
   site owner's. If a detail is unknown, leave a `<!-- TODO(Youngjae): ... -->`
   comment rather than writing something plausible.

## Verify before you finish

```bash
docker compose up -d             # http://localhost:8080
docker compose logs --tail=30    # build must be warning-free
npx prettier . --check
docker compose down
```

Then check by hand: both themes, 375px width, ⌘K palette, the stack filter, and
that no page scrolls horizontally.
