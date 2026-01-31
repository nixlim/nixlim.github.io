---
title: "Task Templating"
description: "Because 'just figure it out' is not a specification, no matter how confidently you say it."
status: "experimental"
github: "https://github.com/nixlim/task_templating"
tech: ["Go", "JSON Schema"]
featured: true
weight: 4
---

Tell an AI agent to "build the thing" and it will happily build *a* thing. Whether it's *your* thing depends entirely on how many assumptions it made to fill the gaps in your vague description. The answer is usually "too many." Task Templating exists because someone got tired of the rework loop and decided to make ambiguity structurally impossible.

The format forces completeness. Every task needs a `TASK_ID`, `TASK_NAME`, `GOAL`, `INPUTS`, `OUTPUTS`, and `ACCEPTANCE` criteria. No optional hand-waving. You also specify `DEPENDS_ON`, `CONSTRAINTS`, and `FILES_SCOPE` because context matters and "just figure it out" is not architecture. If a field is empty, the task isn't ready, and the validator will tell you so in terms that leave no room for negotiation.

The `taskval` CLI runs two tiers of validation because being thorough is the entire point. Tier 1: JSON Schema checks -- required fields, types, patterns, enums. Tier 2: semantic checks -- DAG cycle detection via Kahn's algorithm (because circular dependencies are bad even when an AI creates them), dangling dependency references, goal quality analysis that rejects words like "try" and "explore" (if your goal starts with "try," you don't have a goal), and acceptance criterion vagueness detection. All errors come back structured and machine-readable, so the agent can fix its own specs in a self-correction loop.

There's also a companion research document exploring formal verification with refinement types and SMT solvers for the truly paranoid. The project runs on a single external dependency (`kaptinlin/jsonschema`) because keeping your validation pipeline lightweight is the kind of constraint that prevents it from becoming the problem it's trying to solve.
