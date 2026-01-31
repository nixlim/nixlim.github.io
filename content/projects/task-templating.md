---
title: "Task Templating"
description: "Structured task specification format and validator for AI coding agents"
status: "experimental"
github: "https://github.com/nixlim/task_templating"
tech: ["Go", "JSON Schema"]
featured: true
weight: 4
---

Natural language task descriptions are ambiguous. When an AI coding agent encounters gaps in a specification, it fills them with assumptions -- assumptions that often diverge from the developer's intent, causing rework and defects. Task Templating addresses this with a machine-readable structured task format.

The format (defined in `STRUCTURED_TEMPLATE_SPEC.md`) requires explicit fields for every dimension of a task: `TASK_ID`, `TASK_NAME`, `GOAL`, `INPUTS`, `OUTPUTS`, and `ACCEPTANCE` criteria are mandatory. Contextual fields like `DEPENDS_ON`, `CONSTRAINTS`, and `FILES_SCOPE` force the author to think through dependencies and boundaries. The result is a specification that leaves no room for interpretation -- if a field is empty, the task isn't ready.

The `taskval` CLI implements two-tier validation. Tier 1 uses JSON Schema Draft 2020-12 for structural checks: required fields, types, patterns, and enums. Tier 2 runs semantic checks including DAG cycle detection via Kahn's algorithm, dangling dependency reference detection, goal quality analysis (rejecting vague words like "try" or "explore"), and acceptance criterion vagueness detection. All errors are structured and machine-readable, enabling an LLM self-correction feedback loop where the agent can fix its own task specifications.

A companion research document (`lambda-LLM analysis`) explores formal verification with refinement types and SMT solvers as a supplementary approach for critical algorithmic functions. The project has minimal dependencies -- a single external dependency on `kaptinlin/jsonschema` -- keeping the validation pipeline lightweight and auditable.
