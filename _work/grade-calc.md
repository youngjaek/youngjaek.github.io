---
title: A grade calculator that models how grading actually works
slug: grade-calc
kind: Personal
org: Side project
period: 2025
role: Solo
order: 6
featured: false
repo: https://github.com/youngjaek/grade-calc
headline_metric: Zero
headline_metric_label: third-party dependencies
summary: >
  Every grade calculator online assumes a simple weighted average. Real syllabi
  drop lowest scores, replace a midterm with the final, and mix percentages with
  raw points. This one takes the syllabus as configuration.
stack: [Python, JSON, CLI]
outcomes:
  - value: "Solver"
    label: computes what you need on a remaining component to hit a target
  - value: "0 deps"
    label: runs anywhere Python 3.9+ is installed
  - value: "Config"
    label: each class is a JSON file, not a code change
---

## The problem

Grade calculators on the internet compute a weighted average. Actual syllabi do
not stop there:

- Drop the lowest two quizzes.
- Replace the lower midterm with the final, _if_ the final is higher.
- Homework is scored in points earned out of points possible; participation is a
  flat percentage.
- Some work has not happened yet, and you want to know what you need on it.

Each of those breaks a plain weighted average, and each one is common enough
that hand-computing the result is normal and error-prone.

## The design decision

The interesting choice was making the grading policy **data, not code**. A class
is a JSON file describing its categories, weights, drop policies, replacement
rules and items. Adding a class means writing a config; it never means editing
the calculator.

That framing is what made the awkward rules tractable, because it forced each
one to be named and given a shape:

**Category modes.** `items` averages percentages; `points` sums earned over
possible. Conflating these is the most common source of a wrong answer, because
the two disagree whenever assignments have different point values.

**Drop policies.** "Drop the lowest _k_" per category — applied after
normalising each item to a comparable scale, or the drop picks the wrong item.

**Replacement rules.** "Replace the lower midterm with the final" is a
conditional rewrite of the grade book before aggregation, not a weighting
adjustment.

**Mixed and future scores.** An item can be a raw number, an `"earned/possible"`
string, a percentage, or a prediction. Predictions are tracked separately so the
tool can report current standing (completed work only, weights renormalised) and
a projection side by side.

## The part I actually use

The feature that justified the project is the **target solver**: given a goal
overall grade, compute the score needed on a specific remaining component.

```bash
python3 grade_calc_flex.py --config examples/stat410.json --target 90 --solve-for Final
```

It is an inversion of the same aggregation pipeline, which is only clean because
the pipeline is a pure function of the config and the grade book. Had the
policies been scattered through the code as special cases, solving backwards
through them would have been miserable.

## Why no dependencies

It runs anywhere Python 3.9+ exists, with no virtualenv, no install step and no
supply chain. For a script you want to run once a month on a laptop you may have
just reinstalled, that constraint is worth more than any library it rules out.

[Source on GitHub →](https://github.com/youngjaek/grade-calc)
