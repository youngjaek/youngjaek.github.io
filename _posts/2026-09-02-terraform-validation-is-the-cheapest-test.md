---
title: Terraform validation blocks are the cheapest tests you will ever write
date: 2026-09-02
description: >
  A variable validation costs four lines and turns a class of infrastructure
  mistakes from a 2am incident into a message on a pull request.
tags: [terraform, infrastructure, testing]
---

Most Terraform bugs I have watched people hit are not logic errors. They are
inputs that were never valid and nothing checked.

A CIDR block that does not contain the subnets declared inside it. A region
string that is spelled correctly but does not offer the service the module
needs. An address space that overlaps another environment's. Terraform will take
all three without complaint, and you find out either during an apply that fails
halfway, or months later when something routes somewhere surprising.

## The cheap fix

```hcl
variable "vnet_cidr" {
  type        = string
  description = "Address space for the VNet."

  validation {
    condition     = can(cidrhost(var.vnet_cidr, 0))
    error_message = "vnet_cidr must be valid CIDR notation, e.g. 10.20.0.0/16."
  }
}
```

Four lines. It runs at plan time, before anything is created, and it fails with
a message that says what to do instead of a provider error three layers down.

The bar for adding one should be extremely low. If a reviewer would catch it,
encode it — because a reviewer catches it when they are paying attention, and
the check catches it every time, forever, including on the Friday change nobody
looked at carefully.

## Relationships, not just shapes

Single-variable checks are the easy half. The mistakes that actually hurt are
about relationships _between_ inputs, and those need `precondition` blocks:

```hcl
resource "azurerm_subnet" "this" {
  # ...

  lifecycle {
    precondition {
      condition     = cidrsubnet_contains(var.vnet_cidr, var.subnet_cidr)
      error_message = "subnet_cidr must fall inside vnet_cidr."
    }
  }
}
```

Containment, overlap, "this is only required when that is enabled," "these two
lists must be the same length" — none of these fit in a single variable's
validation block, and all of them are exactly the errors that are easy to write
and hard to see in review.

## What this does not cover

Validation checks inputs. It cannot tell you the module composes correctly, that
a refactor preserved the resource graph, or that an output is still shaped the
way a consumer expects. That is what `terraform test` is for, and the two are
complements: validation rejects bad input, tests prove good input produces the
plan you meant.

Run both in a **plan-only** CI gate. Plan-only matters more than it sounds — it
proves a change is coherent without giving CI permission to create anything, so
the credentials in your pipeline stay minimal and a broken pull request costs a
plan instead of an environment.

## The honest tradeoff

Over-validating is real and annoying. A module that rejects a legitimate
configuration because someone guessed too narrowly at the allowed set is worse
than one that trusts you, and "supported regions" lists go stale faster than
anyone updates them.

My rule: validate things that are **wrong**, not things that are **unusual**. A
subnet outside its VNet is wrong. A region you have not personally tested is
merely unusual — warn, document, and let it through, or you will be editing the
allowed list every quarter.

The asymmetry is what makes this worth it. The check costs four lines once. The
bug it prevents costs an incident, and infrastructure bugs are found at the
worst possible time by definition.
