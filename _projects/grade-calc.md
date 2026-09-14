---
layout: page
title: grade-calc
description: A grade calculator that models how grading policies actually work.
importance: 2
category: fun
github: https://github.com/youngjaek/grade-calc
---

Most grade calculators compute a weighted average. Real syllabi drop the lowest two quizzes,
replace the lower midterm with the final if the final is higher, score homework in points
earned out of possible while participation is a flat percentage, and include work that has
not happened yet.

Each of those breaks a plain weighted average, so this one takes the grading policy as
**data rather than code**: a class is a JSON file describing its categories, weights, drop
policies, replacement rules and items. Adding a class means writing a config, never editing
the calculator.

### What it handles

- **Category modes** — `items` averages percentages, `points` sums earned over possible.
- **Drop policies** — drop the lowest _k_ per category, applied after normalising.
- **Replacement rules** — conditional rewrites of the grade book before aggregation.
- **Mixed and future scores** — raw numbers, `"earned/possible"` strings, percentages, or
  predictions, with current standing and projection reported side by side.

### Target solver

The feature that justified the project: given a goal, compute what you need on a remaining
component.

```bash
python3 grade_calc_flex.py --config examples/stat410.json --target 90 --solve-for Final
```

That is an inversion of the same aggregation pipeline, which stays clean only because the
pipeline is a pure function of the config and the grade book. No third-party dependencies —
it runs anywhere Python 3.9+ is installed.

Source: [youngjaek/grade-calc](https://github.com/youngjaek/grade-calc)
