---
layout: page
permalink: /about/
title: About
eyebrow: About
heading: How I work, and what I keep coming back to
lede: >
  The short version is on my résumé. This is the part that does not fit in
  bullet points.
description: >
  Youngjae Kim — background, how I approach engineering work, and how to
  get in touch.
---

I study Computer Science and Mathematics at the University of Maryland, and I
have spent most of the last three years writing backend and infrastructure code
in production — first at [EchoIT](/work/redis-cache-aside/) in Seoul, then at
[MindGrasp](/work/rag-support-drafting/), and currently at
[Easy Dynamics](/work/azure-network-foundation/).

<!-- TODO(Youngjae): a paragraph in your own voice here. What got you into this,
     what you were doing in Seoul, why math alongside CS. Two or three sentences
     of actual personality does more for a reader than anything I can write
     from a résumé. -->

## What I care about

**Latency is a design problem, not a tuning problem.** The fastest thing I ever
shipped was not a faster query — it was a cache-aside layer that meant the query
usually did not run at all. Most of the performance work I have done came from
changing what work happens, not from making the same work quicker.

**Infrastructure should refuse bad input.** At Easy Dynamics most of my Terraform
work is validation: region support, CIDR overlaps, subnet containment. None of
that is visible when it works. All of it is visible at 2am when it does not
exist. A module that fails at plan time with a clear message is worth more than
one that applies cleanly and leaves a subtly wrong network behind.

**Boring code in the right shape beats clever code in the wrong one.** Splitting
a monolithic Flask app into blueprints with shared middleware was not
intellectually interesting. It made every subsequent change smaller, which was
the entire point.

**Math is the part I did not expect to use.** Probability theory turned out to be
directly useful the moment I needed a ranking that did not let a film with three
ratings outrank one with three hundred — that is a
[Bayesian average](/work/kinoboxd/), and I only reached for it because a stats
course had made it obvious.

## What I am doing now

Building multi-region Azure network foundations in Terraform, and validating
reusable modules against NIST 800-53 and federal compliance standards. I am
graduating in May 2027 and looking for new grad software engineering roles,
ideally somewhere backend-heavy.

Outside of work I am usually rewriting something small that already exists,
because that is how I learn how it works.

## Elsewhere

- **Email** — [alexykim02@gmail.com](mailto:alexykim02@gmail.com)
- **GitHub** — [@youngjaek](https://github.com/youngjaek)
- **LinkedIn** — [ykim02](https://www.linkedin.com/in/ykim02)
- **Résumé** — [PDF](/assets/pdf/Youngjae_Kim_Resume.pdf)
