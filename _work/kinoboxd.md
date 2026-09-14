---
title: Ranking films by who you actually trust
slug: kinoboxd
kind: Personal
org: Side project
period: 2026
role: Solo
order: 5
featured: true
repo: https://github.com/youngjaek/kinoboxd
headline_metric: Bayesian
headline_metric_label: ranking that survives small sample sizes
summary: >
  A Letterboxd cohort scraper that builds per-friend-group film rankings — which
  turns out to be a sampling problem, a rate-limiting problem, and an incremental
  sync problem before it is a ranking problem.
stack: [Python, SQLAlchemy, SQL, Typer, Web scraping]
outcomes:
  - value: "Cohorts"
    label: rankings scoped to a follow graph, not the global average
  - value: "Incremental"
    label: sync via per-member activity instead of full re-scrapes
  - value: "Bayesian"
    label: weighted average so three ratings cannot beat three hundred
---

## The idea

A global film rating tells you what everyone thinks. That is rarely the question
you have. The question is usually closer to _what do the people whose taste I
recognise think_ — and that is a different, much smaller sample.

Kinoboxd builds rankings scoped to a **cohort**: you and the people you follow,
or a friend and the people they follow. It crawls the follow graph to define the
cohort, scrapes each member's rated films, normalises them into a relational
schema, and computes rankings from that population only.

## Why a naive average is wrong

The moment you restrict to a cohort, sample sizes collapse. A film rated 5 stars
by two people would outrank a film rated 4.5 by three hundred, which is
obviously not what anyone means.

The fix is a **Bayesian weighted average**: pull each film's score toward the
cohort's overall mean, with the strength of that pull inversely proportional to
how many ratings the film actually has.

```text
score = (v / (v + m)) * R  +  (m / (v + m)) * C
```

where `R` is the film's mean rating in the cohort, `v` is its number of ratings,
`C` is the cohort's mean across all films, and `m` is a tunable prior weight —
effectively "how many ratings before I start believing you."

A film with few ratings sits near the cohort mean and has to earn its way up. A
film with many ratings is dominated by its own average. `m` is the only knob,
and it directly expresses how much evidence you demand.

This was the moment a probability course paid for itself. I did not derive
anything; I recognised the shape of the problem because I had seen it before.

## The parts that were actually hard

**Rate limiting.** Crawling a follow graph means a lot of requests to someone
else's servers. The scrapers go through a single throttled HTTP client, which is
both the polite thing to do and the only way the crawl finishes at all.

**Incremental updates.** Re-scraping every member's full history to pick up a
handful of new ratings is enormously wasteful and gets slower every time the
cohort grows. Instead, updates come from each member's "when rated" activity
feed, so a refresh costs roughly the number of _new_ ratings rather than the
total. This is the difference between a tool you run once and a tool you keep
running.

**Schema before features.** Normalised tables for members, films and ratings,
with a materialised view for the aggregate, meant the ranking strategy became a
query rather than a rewrite. Adding a second strategy later does not touch
scraping.

## Structure

```
src/letterboxd_scraper/
    cli.py          # Typer entry point
    config.py       # TOML + env configuration
    db/             # SQLAlchemy models + session helpers
    scrapers/       # follow graph, ratings, RSS — via a throttled client
    services/       # cohort, rating, ranking, export, RSS update
```

The layering is deliberate: scrapers know about HTML and nothing about ranking,
services know about the domain and nothing about HTTP, and the CLI knows about
neither. It made the ranking work testable without touching the network, which
is the whole reason the split exists.

[Source on GitHub →](https://github.com/youngjaek/kinoboxd)
