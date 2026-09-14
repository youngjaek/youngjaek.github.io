---
title: Cache invalidation is a delete, not an update
date: 2026-08-19
description: >
  Writing the new value into the cache on every mutation feels tidier than
  deleting the key. It is also a race condition waiting for enough traffic.
tags: [redis, caching, concurrency]
---

When you add a cache in front of a database, you have to decide what happens on
a write. There are two obvious options, and the tidier-looking one is wrong.

**Option A — update the cache.** Write to the database, then write the new value
to the cache. The cache stays warm. No request pays a miss.

**Option B — delete the key.** Write to the database, then delete the cache
entry. The next read misses, goes to the database, and repopulates.

Option A looks strictly better. It is not.

## The race

Two concurrent operations on the same key. A reader that missed the cache and is
on its way back with an old value, and a writer that is updating it:

```text
Reader:  GET key            -> miss
Reader:  SELECT ...         -> reads v1
Writer:  UPDATE ...         -> writes v2
Writer:  SET key = v2                        (cache now correct)
Reader:  SET key = v1                        (cache now wrong, forever)
```

The reader's write lands last, and the cache is left holding `v1` while the
database holds `v2`. Nothing retries, because nothing knows anything is wrong.
The entry is stale until its TTL expires — and if you were clever enough to skip
TTLs on a hot key, it is stale until someone notices.

This is not exotic. It needs only a read that misses at roughly the same moment
as a write, which at any real request rate happens constantly.

Now the same interleaving with Option B:

```text
Reader:  GET key            -> miss
Reader:  SELECT ...         -> reads v1
Writer:  UPDATE ...         -> writes v2
Writer:  DEL key                             (no-op, key absent)
Reader:  SET key = v1                        (cache holds v1)
```

Still wrong — but only until the key expires, and critically, _delete is
idempotent and order-insensitive in a way that set is not_. The common
interleavings all resolve to "key absent," which is always safe: the next read
goes to the database and gets the truth. To leave a stale value behind you need
the reader's `SET` to land after the writer's `DEL`, which is a much narrower
window than "any interleaving at all."

## Why the asymmetry

A cache entry has exactly two safe states: **correct** and **absent**. Absent
costs one slow request. Wrong costs correctness, silently, for as long as the
entry survives.

`DEL` can only ever move the entry toward _absent_. `SET` can move it to _wrong_
— it is asserting a value, and a value computed before a concurrent write is a
stale assertion. Deleting asserts nothing. That is the whole argument.

## The rules I actually follow

**Delete, do not update.** One operation, always safe.

**Delete after the database write commits, not before.** Deleting first leaves a
window where a reader can repopulate from the pre-write state.

**Put a TTL on everything, even keys you invalidate explicitly.** Invalidation
logic has bugs and cache keys get missed during refactors. A TTL is the bound on
how long any of those mistakes can serve wrong data. It converts a correctness
incident into a latency blip.

**If you genuinely cannot afford the miss, cache a computed value, not a copy of
a row.** At that point you want a different pattern — write-through, or an
explicit materialisation you own — rather than a cleverer version of Option A.

Option B is one extra slow request. Option A is a bug that only reproduces
under load.
