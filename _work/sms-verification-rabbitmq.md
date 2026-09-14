---
title: An SMS verification service at 5,000 messages a minute
slug: sms-verification-rabbitmq
kind: Professional
org: EchoIT
period: 2023 — 2025
role: Software Engineer
order: 4
featured: false
headline_metric: 5,000/min
headline_metric_label: messages, under 50 ms average task time
summary: >
  Verification codes have to arrive quickly and exactly once, while depending on
  a third party that will eventually be slow. RabbitMQ between the request and
  the provider made both halves of that possible.
stack: [Java, Spring Boot, RabbitMQ, Docker, Jenkins]
outcomes:
  - value: "5,000/min"
    label: sustained message throughput
  - value: "<50ms"
    label: average task processing time
  - value: "Async"
    label: API responses decoupled from provider latency
---

## The problem

SMS verification sits on the critical path of signup and login, and it depends
on something you do not control: an external SMS provider. That provider will,
at some point, be slow, rate-limit you, or briefly fail.

Doing the send synchronously inside the request means the user's login is only
as fast and only as reliable as the provider on its worst day. Under burst
traffic — which is exactly when signups spike — that is precisely when it breaks.

## Why a queue

Putting RabbitMQ between the API and the provider decouples the two halves:

- The API enqueues a send and returns immediately. Response time stops being a
  function of provider latency.
- Consumers drain the queue at a rate the provider can actually absorb. A burst
  becomes queue depth instead of a wall of errors and retries.
- A transient provider failure becomes a retry against a durable message rather
  than a lost verification code and a user who cannot log in.

The system sustained 5,000 messages per minute with average task processing time
under 50 ms.

## The hard part is exactly-once, which does not exist

A queue gives you at-least-once delivery. For verification codes, the
difference matters: a duplicate is a second text message to a real person, and
enough duplicates is a bill plus a support ticket.

The standard resolution is to stop trying to achieve exactly-once _delivery_ and
instead make the consumer **idempotent** — key the work so that processing the
same message twice produces the same result as processing it once, then
acknowledge only after the work is durably done. Acknowledging before the work
completes turns a consumer crash into a silently dropped message; acknowledging
after turns it into a redelivery your idempotency key absorbs.

<!-- TODO(Youngjae): fill in what you actually did —
     - How you keyed idempotency (request id? phone + window?).
     - Prefetch/concurrency settings and how you arrived at 5,000/min.
     - Whether you used a DLQ, and what ended up in it.
     - Retry/backoff policy against the provider. -->

## Where it sat

The service was built in Java and Spring Boot and deployed through the same
Jenkins and Docker CI/CD pipeline as the rest of the platform, alongside
reusable microservice components I built in a Node.js backend framework and an
Elasticsearch prototype for search.
