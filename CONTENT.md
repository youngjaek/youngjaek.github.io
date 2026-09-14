# Adding content

Everything below is plain files in this repo. Add the file, save, and the dev
server (`docker compose up`) picks it up. Push to `main` to publish.

## Blog post → `/blog/`

Create `_posts/YYYY-MM-DD-some-slug.md`. The date in the filename is what orders
the post, and `layout: post` is required (this site sets no default layout for
posts).

```markdown
---
layout: post
title: Cache invalidation is a delete, not an update
date: 2026-09-14
description: Short line shown under the title in the post list.
tags: [redis, caching]
categories: notes
---

Your post, in Markdown. Code fences, tables and images all work.
```

URL comes out as `/blog/2026/cache-invalidation-is-a-delete-not-an-update/`.

Optional extras: `toc: { sidebar: left }` for a sidebar table of contents,
`featured: true` to pin it to the top of the blog index, `related_posts: false`
to hide the related list.

Once you have at least one post, open `_pages/about.md` and set
`latest_posts.enabled: true` so recent posts show on the home page. It is off
right now only because an empty list renders a heading with nothing under it.

## Book → `/books/`

Create `_books/some-slug.md` with `layout: book-review`.

```markdown
---
layout: book-review
title: Pachinko
author: Min Jin Lee
olid: OL26222911M # Open Library ID, fetches the cover for you
categories: fiction historical
tags: favourites
released: 2017
started: 2026-08-01
finished: 2026-08-20
stars: 5
status: Finished # Finished | Reading | To Read
buy_link: https://example.com/optional
---

What you thought of it.
```

For the cover, easiest to hardest:

1. `olid:` an Open Library ID (search the book on openlibrary.org, the ID is in
   the URL, looks like `OL26222911M`).
2. `isbn:` the ISBN, used if there is no `olid`.
3. `cover: assets/img/book_covers/pachinko.jpg` to supply your own image.

`stars` accepts halves (`4.5`). `status` drives the shelf grouping.

## Film screenshot → `/films/`

Two steps, because these are images rather than pages.

1. Drop the image in `assets/img/films/`.
2. Add an entry to `_data/films.yml`:

```yaml
- image: chungking-express-01.jpg
  title: Chungking Express
  year: 1994
  director: Wong Kar-wai
  note: The pineapple tins.
```

Only `image` and `title` are required; `title` doubles as the alt text. The grid
crops to 16:9, so screenshots at roughly that ratio look best.

If you would rather write about a film than just post a frame, make it a blog
post instead and link to it from the note.

## Project → `/projects/`

Create `_projects/some-slug.md` with `layout: page`.

```markdown
---
layout: page
title: kinoboxd
description: One line shown on the project card.
importance: 1 # lower sorts first
category: fun
github: https://github.com/youngjaek/kinoboxd
img: assets/img/projects/kinoboxd.png # optional card image
---
```

The page body can use the helper blocks from `_sass/_project-custom.scss`:
`.proj-stats`, `.pipeline`, `.proj-note` and `.proj-table`. See
`_projects/kinoboxd.md` for how each is written.

## Resume entry → `/resume/`

Edit `_data/cv.yml`. Nothing in `_pages/resume.md` needs touching unless you are
adding a whole new section, in which case add its name to `cv_section_order`
there.

Logos live in `assets/img/logos/` and are referenced by filename. If you add an
SVG and it renders at zero size, it is missing `width` and `height` attributes;
add them to match its `viewBox`.
