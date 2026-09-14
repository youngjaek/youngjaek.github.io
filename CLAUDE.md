# CLAUDE.md

@AGENTS.md

`AGENTS.md` is the authoritative entry point: change routing, the six
non-negotiables, and the verification loop. Read it first. `README.md` covers
running the site and adding content.

Everything below is detail that does not belong in the short entry point.

## Why this repo looks the way it does

It began as a clone of the al-folio **starter** template and was rebuilt as a
personal site. The starter's own agent rules — a style contract forbidding
`_layouts/`, `_includes/`, `_sass/`, plus visual-regression and upgrade-audit
CI — were removed, because they exist to keep the _template_ thin and do not
apply to a site built from it. `al_folio_core` is still the theme gem, so
`bundle update` remains a viable upgrade path; the site simply does not use its
visual layer.

## The performance budget

The whole point of the rebuild. Current per-page cost, uncompressed:

| Asset                        | Size     |
| ---------------------------- | -------- |
| `main.css` (Sass-compressed) | ~29 KB   |
| `site.js`                    | ~9 KB    |
| `inter-latin-var.woff2`      | 48 KB    |
| HTML                         | 20–41 KB |

That is the entire runtime — no framework, no jQuery, no Bootstrap, no
FontAwesome, no MathJax, no CDN. Adding any of those back needs a real reason.

Two consequences worth knowing:

- **No MathJax.** Do not write `$$...$$` in Markdown; it renders literally.
  Use a fenced `text` block for formulas.
- **The command palette indexes at build time.** `_includes/palette.liquid`
  renders every page, case study and post as a real link, so search is a
  substring match with no JSON fetch. A new content type needs a block there.

## Gotchas that cost time

- **Kramdown wraps bullets in `<p>`.** `_layouts/home.liquid` strips those tags
  when rendering `_data/experience.yml` points so inline `**bold**` works.
- **`.prose li` styles every `li`.** Tag pills inside prose are opted out
  explicitly in `_sass/_prose.scss`. Any other markup list inside `.prose`
  needs the same treatment.
- **Inline-flex elements share a line.** `.article__back` is `display: flex`
  with `width: fit-content` because the eyebrow after it would otherwise sit
  beside it.
- **The dev container writes to `/tmp/_site`,** not the bind-mounted `_site`,
  to avoid host bind-mount write deadlocks on Windows and macOS.

## Deploy

`.github/workflows/deploy.yml` → GitHub Pages on push to `main`. It builds with
`JEKYLL_ENV=production` and fails on broken internal links. `baseurl` is empty
because this is a user page served from the domain root — do not set it to a
subpath.
