---
title: A multi-region Azure network foundation that refuses bad input
slug: azure-network-foundation
kind: Professional
org: Easy Dynamics
period: 2026 — present
role: Software Engineer Intern
order: 1
featured: true
headline_metric: Plan-time
headline_metric_label: failures instead of apply-time surprises
summary: >
  Hub-and-spoke VNets across multiple Azure regions in Terraform, where most of
  the engineering went into validation that makes a misconfigured network fail
  before it exists.
stack: [Terraform, Azure, CI/CD, GitHub Actions, NIST 800-53]
outcomes:
  - value: "Multi-region"
    label: hub-and-spoke VNets with flow logging and per-region diagnostics
  - value: "Plan-only CI"
    label: gate running Terraform tests on every change
  - value: "0"
    label: manual steps in the module release path
---

## The problem

Network foundations are the layer everything else sits on, which makes them the
worst place for a mistake. A subnet that overlaps another region's address
space, a CIDR block that does not actually contain the subnets declared inside
it, a region that does not offer a service the module assumes — each of these
either applies cleanly and breaks something months later, or fails halfway
through an apply and leaves the environment in a state nobody wants to debug.

Terraform will happily let you do all three.

## The approach

The provisioning itself is the straightforward part: hub-and-spoke VNets, flow
logging, and per-region diagnostics, built as reusable modules across two-week
sprints. The part worth writing about is the validation.

**Region support.** Not every Azure region offers every service, and the failure
mode when one does not is an error deep in an apply. Validating the region
against a supported set at plan time turns that into a one-line message before
anything is created.

**CIDR overlap.** In a multi-region hub-and-spoke topology, address spaces have
to be disjoint across the whole estate, not merely valid on their own. Two
regions can each be internally consistent and still collide — and the moment
they do, peering either fails or, worse, routes somewhere surprising.

**Subnet containment.** A subnet declared outside its parent VNet's address
space is a configuration that is wrong in a way that is easy to write and hard
to see.

All three are checks a human reviewer _can_ do and will eventually fail to do,
at exactly the moment it matters. Encoded as Terraform validation and covered by
Terraform tests in a plan-only CI gate, they run on every change, for free,
forever.

The plan-only part matters: the gate proves a change is coherent without
granting CI the ability to create anything. That keeps the credentials CI needs
to the minimum, and it means a broken pull request costs a plan, not an
environment.

## Releases

Alongside the modules, I automated the IaC release path: CI/CD pipelines that
promote Terraform modules from their source repositories into an internal
artifact registry. Before that, releases were manual, which meant the registry
and the source drifted apart in small ways that only surfaced when someone
pinned a version and got something they did not expect. Automating promotion
removed the drift by removing the step where it was introduced.

## Compliance as a first-class constraint

I also validated reusable modules across multiple Azure regions against NIST
800-53 and federal compliance standards, and documented severity-rated gaps with
recommendations — which module maintainers and platform architects then adopted.

The useful framing here is that compliance controls are mostly just
infrastructure requirements written by someone who has already seen the failure.
"Enable flow logging" is an audit checkbox and also the only reason you can
answer a question about traffic after the fact. Treating the control as the
requirement, rather than as paperwork layered on top of one, is what makes it
land in the module instead of in a spreadsheet.

<!-- TODO(Youngjae): worth adding when you can share it —
     - A sanitized example of one validation block. Concrete beats described.
     - How the plan-only gate is wired (OIDC? a read-only service principal?).
     - One gap you found in the NIST review that actually changed a module. -->

## What I took away

The best outcome of this work is invisible: networks that were never built
wrong. That makes it genuinely hard to demo, and it is still the part I would
defend first — a module that fails at plan time with a clear message is worth
more than one that applies cleanly and leaves a subtly wrong network behind.
