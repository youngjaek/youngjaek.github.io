---
title: Retrieval and agents for customer support drafts
slug: rag-support-drafting
kind: Professional
org: MindGrasp
period: 2025 — 2026
role: Software Engineer (Part-time)
order: 2
featured: true
headline_metric: "28%"
headline_metric_label: less manual editing per draft
summary: >
  A retrieval layer plus a multi-step agentic workflow that drafts support
  replies from ticket history and the knowledge base — measured against the
  only metric that counts, how much editing a human still has to do.
stack: [Python, Flask, RAG, LLM, Agents, Tool calling]
outcomes:
  - value: "28%"
    label: reduction in manual editing time across ~60 drafts per week
  - value: "10+"
    label: pull requests reviewed as primary technical reviewer
  - value: "Blueprints"
    label: monolithic Flask backend refactored into modular components
---

## The problem

Support agents answering an internal queue were doing the same work on every
ticket: find the similar tickets, find the relevant knowledge-base article,
reconstruct the customer's history, then write a reply that mostly restates
things the system already knew.

That is a retrieval problem wearing a writing problem's clothes. The reply is
easy to generate once the right context is in front of you; assembling the right
context is the hard part and the part that was eating the time.

## Retrieval first, generation second

The layer I built assembles context before anything is generated: relevant
tickets, relevant knowledge-base material, and the surrounding case detail, then
hands that to the model to draft a reply.

Getting this ordering right is most of the work. A generation step with weak
context produces fluent, confident, wrong drafts — which are _worse_ than no
draft at all, because the agent now has to read carefully to catch an error
instead of writing from scratch. The quality ceiling of the whole system is set
by retrieval, not by the model.

## Why a multi-step agent instead of one retrieval pass

Single-shot retrieval works when the query is the question. Support tickets are
frequently not: the ticket says one thing, the actual issue is a consequence of
something the customer mentioned three messages ago, and the relevant article is
indexed under vocabulary the customer never uses.

So the workflow became multi-step with tool calling — gather context, assess
whether it is sufficient, refine and gather again across sources before
drafting. Each step can decide it does not yet have enough and go back, which
is the behavior that handles tickets where the first query was aimed at the
wrong thing.

The cost is latency and complexity, and both are real. It is worth it only when
a meaningful share of queries genuinely need the second pass — which is
something to verify, not assume.

## Measuring the thing that matters

The metric was **manual editing time**, not retrieval precision, not a
similarity score, not whether the draft "looked good." Across roughly 60 drafts
per week it dropped 28%.

Editing time is the right metric because it is the only one that captures the
failure mode that matters. A draft that is 90% correct but wrong in one
confident sentence can take _longer_ to fix than writing from nothing. Offline
retrieval metrics cannot see that; the human's stopwatch can.

<!-- TODO(Youngjae): the parts I cannot write for you —
     - What the retrieval stack actually was (embedding model, vector store,
       hybrid/BM25, reranking?) and why.
     - How chunking was handled for KB articles.
     - How editing time was measured — this is the most credible detail in the
       whole piece and readers will want it.
     - A failure case the agent loop handled that single-shot retrieval did not. -->

## The unglamorous half

Alongside the retrieval work I refactored the monolithic Flask backend into
modular blueprints with shared middleware and centralized error handling, and
reviewed 10+ pull requests as the primary technical reviewer on the codebase.

None of that shows up in a demo. It is the reason the retrieval work could be
added without threading changes through a single large module, and the reason
errors surfaced in one place instead of being handled four different ways in
four different routes.
