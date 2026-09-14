---
layout: page
title: kinoboxd
description: Letterboxd cohort scraper that builds per-friend-group film rankings.
importance: 1
category: fun
github: https://github.com/youngjaek/kinoboxd
---

A global film rating tells you what everyone thinks, which is rarely the question you
actually have. Kinoboxd builds rankings scoped to a **cohort** — you and the people you
follow, or a friend and the people they follow.

It crawls the follow graph to define the cohort, scrapes each member's rated films,
normalises them into a relational schema, and computes rankings from that population only.

### Ranking

Restricting to a cohort collapses sample sizes, so a naive average lets a film rated by two
people outrank one rated by three hundred. Ranking uses a Bayesian weighted average instead,
pulling each film's score toward the cohort mean in proportion to how few ratings it has:

```text
score = (v / (v + m)) * R  +  (m / (v + m)) * C
```

where `R` is the film's mean in the cohort, `v` its number of ratings, `C` the cohort mean,
and `m` a tunable prior weight — effectively how much evidence you require before believing
a score.

### Structure

```
src/letterboxd_scraper/
    cli.py          # Typer entry point
    config.py       # TOML + env configuration
    db/             # SQLAlchemy models + session helpers
    scrapers/       # follow graph, ratings, RSS — via a throttled client
    services/       # cohort, rating, ranking, export, RSS update
```

Scrapers know about HTML and nothing about ranking; services know the domain and nothing
about HTTP. Refreshes are incremental, driven by each member's "when rated" activity feed,
so an update costs roughly the number of _new_ ratings rather than the full history.

Source: [youngjaek/kinoboxd](https://github.com/youngjaek/kinoboxd)
