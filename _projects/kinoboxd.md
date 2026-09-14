---
layout: page
title: kinoboxd
description: A scraping and ranking pipeline that turns a Letterboxd follow graph into per-cohort film rankings.
importance: 1
category: fun
github: https://github.com/youngjaek/kinoboxd
---

A global film rating tells you what everyone thinks, which is rarely the question you
actually have. The question is usually closer to _what do the people whose taste I
recognize think_, and that is a much smaller and much noisier sample.

**Kinoboxd** answers it by building rankings scoped to a **cohort**: you and the people you
follow, or a friend and the people they follow. Most of the work turned out to be data
engineering rather than ranking. Getting the data out without hammering anyone's servers,
modeling it so it could be aggregated, and keeping it fresh without re-scraping everything
took far longer than the ranking math did.

<div class="proj-stats">
  <div class="proj-stat">
    <div class="proj-stat-value">5 stages</div>
    <div class="proj-stat-label">Discover, extract, load, aggregate, rank</div>
  </div>
  <div class="proj-stat">
    <div class="proj-stat-value">Incremental</div>
    <div class="proj-stat-label">Refresh cost scales with new ratings, not history</div>
  </div>
  <div class="proj-stat">
    <div class="proj-stat-value">Idempotent</div>
    <div class="proj-stat-label">Ratings upserted, so a failed run is safe to repeat</div>
  </div>
  <div class="proj-stat">
    <div class="proj-stat-value">Bayesian</div>
    <div class="proj-stat-label">Ranking that holds up on small samples</div>
  </div>
</div>

## The pipeline

<div class="pipeline">
  <div class="pipeline-stage">
    <div class="pipeline-stage-name">1 · Discover</div>
    <div class="pipeline-stage-desc">Crawl the follow graph to resolve who is in the cohort.</div>
  </div>
  <div class="pipeline-arrow" aria-hidden="true">→</div>
  <div class="pipeline-stage">
    <div class="pipeline-stage-name">2 · Extract</div>
    <div class="pipeline-stage-desc">Scrape each member's rated films through a throttled HTTP client.</div>
  </div>
  <div class="pipeline-arrow" aria-hidden="true">→</div>
  <div class="pipeline-stage">
    <div class="pipeline-stage-name">3 · Load</div>
    <div class="pipeline-stage-desc">Upsert into a normalized schema, idempotent on re-run.</div>
  </div>
  <div class="pipeline-arrow" aria-hidden="true">→</div>
  <div class="pipeline-stage">
    <div class="pipeline-stage-name">4 · Aggregate</div>
    <div class="pipeline-stage-desc">Materialized view of per-film counts and means per cohort.</div>
  </div>
  <div class="pipeline-arrow" aria-hidden="true">→</div>
  <div class="pipeline-stage">
    <div class="pipeline-stage-name">5 · Rank</div>
    <div class="pipeline-stage-desc">Apply a ranking strategy over the view and export CSV.</div>
  </div>
</div>

Each stage is a separate service module. The boundary that matters most is that scrapers
know about HTML and nothing about ranking, while services know the domain and nothing about
HTTP. That split is why the ranking logic can be tested without touching the network.

## Extraction and rate limiting

Crawling a follow graph means a lot of requests to someone else's servers. The naive
version, a fan-out of concurrent requests per member, gets rate limited within minutes and
never finishes.

All scrapers share a **single throttled HTTP client**. Request pacing, retries and backoff
live in that one place, so throttling is a property of the system rather than something each
scraper has to remember. It is slower per request and much faster end to end, because the
crawl actually completes.

<div class="proj-note">
  Rate limits are not a setting you tune at the end. They decide the shape of the extraction
  layer, so the limiter has to be the thing everything else is built around.
</div>

## Schema design

The tempting thing with scraped data is to store what you scraped, one row per member per
page. That turns every later question into a reprocessing job.

The loader normalizes into a small relational schema instead, so a new ranking strategy is a
query rather than a rewrite:

<div class="proj-table-wrap">
  <table class="proj-table">
    <thead>
      <tr><th>Table</th><th>Grain</th><th>Why it exists</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><code>members</code></td>
        <td>one row per Letterboxd user</td>
        <td>Cohort membership becomes a join, not a re-crawl.</td>
      </tr>
      <tr>
        <td><code>films</code></td>
        <td>one row per film</td>
        <td>Deduplicates titles across every member's history.</td>
      </tr>
      <tr>
        <td><code>ratings</code></td>
        <td>one row per (member, film)</td>
        <td>The fact table. Upserted, so re-runs are idempotent.</td>
      </tr>
      <tr>
        <td><code>cohort_film_stats</code></td>
        <td>materialized, one row per (cohort, film)</td>
        <td>Counts and means precomputed so ranking stays cheap.</td>
      </tr>
    </tbody>
  </table>
</div>

Ratings are **upserted on `(member, film)`** rather than appended. That is what makes the
pipeline safe to re-run: a crawl that dies halfway can just be run again, and nothing
double counts.

## Incremental sync

The first version re-scraped every member's full history on each refresh. It worked, and it
got slower every time the cohort grew, which is the kind of thing that stops you from
running a tool at all.

Refreshes now read each member's **"when rated" activity feed** and pull only what changed,
so a refresh costs roughly the number of new ratings instead of the total. Full crawls
became the backfill path rather than the normal one.

```python
# Only the tail of the activity feed is new work.
since = last_synced_at(member)
new_ratings = (r for r in activity_feed(member) if r.rated_at > since)
upsert_ratings(member, new_ratings)   # idempotent on (member, film)
```

## Ranking

Restricting to a cohort collapses sample sizes. A film rated 5 stars by two people would
outrank one rated 4.5 by three hundred, which is not what anyone means.

The fix is a **Bayesian weighted average**, which pulls each film's score toward the cohort
mean in proportion to how little evidence it has:

```text
score = (v / (v + m)) * R  +  (m / (v + m)) * C
```

`R` is the film's mean rating within the cohort, `v` its number of ratings, `C` the cohort's
overall mean, and `m` a tunable prior weight, effectively how many ratings you want before
you start believing a score. A film with few ratings sits near the mean and has to earn its
way up. A film with many is dominated by its own average.

`m` is the only knob, and it maps onto a question you can actually answer: how much evidence
do I want before I trust this number?

## Structure

```
src/letterboxd_scraper/
    cli.py          # Typer entry point
    config.py       # TOML + env configuration
    db/             # SQLAlchemy models + session helpers
    scrapers/       # follow graph, ratings, RSS, all via the throttled client
    services/       # cohort, rating, ranking, export, RSS update
```

Rankings export to CSV. The useful output is a query result, not a bespoke format.

Source: [youngjaek/kinoboxd](https://github.com/youngjaek/kinoboxd)
