# youngjaek.github.io

Personal site — case studies, notes, and an interactive version of my résumé.

Jekyll, with [al-folio](https://github.com/alshedivat/al-folio) as the theme
runtime. Every layout, include and stylesheet the site renders is local
(`_layouts/`, `_includes/`, `_sass/`); the gem is the host, not the look.

## Run it

Docker, no Ruby needed on the host:

```bash
docker compose up
```

Then open <http://localhost:8080>. Edits reload automatically.

With Ruby installed locally instead:

```bash
bundle install
bundle exec jekyll serve
```

## Where things live

| What                                     | Where                           |
| ---------------------------------------- | ------------------------------- |
| Home page copy (headline, lede, contact) | `_pages/home.html` front matter |
| Experience timeline                      | `_data/experience.yml`          |
| Filter chips above the timeline          | `_data/filters.yml`             |
| Toolkit section                          | `_data/stack.yml`               |
| Nav + command-palette entries            | `_data/nav.yml`                 |
| Case studies                             | `_work/*.md`                    |
| Blog posts                               | `_posts/YYYY-MM-DD-slug.md`     |
| Design tokens (color, type, space)       | `_sass/_tokens.scss`            |
| Interactions (palette, theme, filter)    | `assets/js/site.js`             |
| Résumé PDF                               | `assets/pdf/`                   |

## Adding a case study

Create `_work/my-thing.md`:

```yaml
---
title: What I built
slug: my-thing # referenced by `case_study:` in _data/experience.yml
kind: Professional # or Personal — controls which group it lands in on /work/
org: Company
period: 2026
role: Software Engineer
order: 7 # sort order on /work/ and for prev/next
featured: true # show it on the home page
headline_metric: "40%"
headline_metric_label: faster cold starts
summary: One or two sentences for the card.
stack: [Go, Postgres]
outcomes:
  - value: "40%"
    label: faster cold starts
---
Prose goes here.
```

## Notes

- **Colors** are CSS custom properties in `_sass/_tokens.scss`, declared once for
  dark and re-declared for light. Change them there, not in component files.
- **Contrast**: every text/background pair is at or above WCAG AA (4.5:1) in
  both themes. Re-check if you change `--text-subtle` or the code token colors.
- **No icon font.** Icons are inline SVG in `_includes/icon.liquid`.
- **One font file** (`assets/fonts/inter-latin-var.woff2`, latin subset,
  self-hosted and preloaded). No Google Fonts request at runtime.
- **JS is progressive enhancement.** If `site.js` fails to load, the page still
  renders and navigates; reveal animations un-hide themselves after 2 seconds.

## Deploy

`.github/workflows/deploy.yml` builds on push to `main` and publishes to GitHub
Pages. It fails the build on broken internal links.
