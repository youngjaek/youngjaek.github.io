---
title: Cutting P95 latency 85% with a cache-aside layer
slug: redis-cache-aside
kind: Professional
org: EchoIT
period: 2023 — 2025
role: Software Engineer
order: 3
featured: true
headline_metric: 200ms → 30ms
headline_metric_label: P95 API latency
summary: >
  A B2B platform was spending most of its request budget re-reading rows that
  had not changed. Redis in front of MariaDB took P95 from 200 ms to under
  30 ms at a 92% hit rate.
stack: [Java, Spring Boot, Redis, MariaDB, Docker, Jenkins]
outcomes:
  - value: "85%"
    label: reduction in P95 API latency (200 ms → under 30 ms)
  - value: "92%"
    label: cache hit rate in steady state
  - value: "Peak load"
    label: database load reduced most where it mattered most
---

## The problem

The platform was a B2B application on Java and Spring Boot backed by MariaDB.
Under peak traffic, P95 API latency sat around 200 ms — not broken, but slow
enough that the slowest 5% of requests were the ones users noticed, and the
database was the bottleneck every time we looked.

The important detail was _what_ the slow requests were doing. They were not
running expensive analytical queries. They were re-reading the same reference
and entity rows over and over, on every request, for data that changed rarely.
The database was doing real work to return an answer it had already returned
hundreds of times that minute.

## Why caching, and why cache-aside specifically

Once the read pattern is "the same rows, repeatedly, with a low write rate," the
options narrow quickly:

**Tune the queries.** Worth doing, and we did — but indexing a query that is
already using an index does not help. The cost was not the query plan, it was
the round trip plus the contention of doing it thousands of times.

**Read replicas.** This spreads the same wasted work across more machines. It
raises the ceiling without lowering the cost per request, and it adds
replication lag to reason about.

**Cache-aside (lazy loading).** The application checks Redis first; on a miss it
reads MariaDB, writes the value back to Redis with a TTL, and returns it. Writes
invalidate the key rather than trying to update it in place.

Cache-aside won for two reasons. First, it fails open: if Redis is unavailable,
every request degrades to the old path rather than erroring. That property is
hard to overstate — it meant the cache could be introduced without becoming a
new hard dependency on day one. Second, only data that is actually requested
ever enters the cache, so memory tracks real access patterns instead of our
guesses about them.

The alternative, read-through/write-through, keeps the cache authoritative and
consistent but couples availability to Redis and makes every write pay cache
latency. For a workload that was overwhelmingly reads of slowly-changing data,
that trade was backwards.

```java
// The shape of it: try cache, fall back to the database, populate on the way out.
public Entity findById(long id) {
    String key = "entity:" + id;

    Entity cached = redis.get(key);
    if (cached != null) {
        return cached;
    }

    Entity fromDb = repository.findById(id);
    if (fromDb != null) {
        redis.set(key, fromDb, TTL);
    }
    return fromDb;
}
```

## What actually made it work

**Invalidate on write, do not update on write.** Deleting the key on mutation is
one operation that is always correct. Writing the new value into the cache is
two operations that can interleave badly under concurrency and leave a stale
value behind indefinitely. Delete-then-let-the-next-read-repopulate is slower
for exactly one request and correct for all of them.

**A TTL even on invalidated keys.** Invalidation logic has bugs. A TTL bounds how
long any individual bug can serve stale data, which turns a correctness
incident into a latency blip.

**Hit rate is the metric that matters, not latency.** Latency is the outcome;
hit rate is the thing you can act on. Watching it settle at 92% was how we knew
key granularity and TTLs were roughly right — a much lower number would have
meant keys too specific to be reused, and a much higher one would have suggested
TTLs long enough to be risky.

<!-- TODO(Youngjae): the details that only you have —
     - What the cached entities actually were.
     - What TTL you landed on, and how you picked it.
     - Whether you hit a thundering-herd/stampede problem on cold keys, and what
       you did about it. This is the single most interesting thing you could add.
     - Anything that went wrong in the first rollout. -->

## What I would do differently

I would instrument the hit rate _before_ shipping the cache rather than after.
We reasoned our way to the conclusion that reads dominated and repeated
themselves, and we were right — but we were right from inference, not
measurement, and the rollout would have been far less nervous with a week of
access-pattern data in hand first.
