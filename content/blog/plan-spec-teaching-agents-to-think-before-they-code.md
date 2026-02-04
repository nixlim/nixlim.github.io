---
title: "Plan-Spec: Teaching Agents to Think Before They Code"
date: 2026-02-04
draft: false
tags: ["plan-spec", "architecture", "vibe-coding", "agents", "bdd", "tdd"]
description: "Ask an AI agent to plan a feature and you'll get a brain dump with the structural integrity of a napkin sketch. Plan-Spec exists to turn that into something you'd actually build from."
---

<img src="/images/plan-spec.png" alt="Plan-Spec: structured specification pipeline for AI coding agents">

A good specification answers four questions: what are we building, how do we know it works, what happens when it doesn't, and where does each requirement trace to? Most AI-generated plans answer the first question enthusiastically and hand-wave the other three.

The problem isn't that the agent can't think. The problem is that nobody told it how to think *systematically*.

This matters because specifications are contracts. When an agent builds from a spec that says "user can reset their password" with no acceptance criteria, no boundary conditions, and no test plan, the agent fills the gaps itself. 

So Opus and I built a skill that forces the thinking to happen before the first line of code exists.

## How it works

Plan-Spec is a Claude Code skill -- Markdown files in `.claude/skills/plan-spec/` that teach the agent a structured process for producing specifications. No runtime code. No dependencies. About 1,145 lines of carefully structured instructions across six files.

```bash
/plan-spec "Add OAuth2 support with Google and GitHub providers"
```

The agent walks through six phases, starting with discovery. It asks clarifying questions about actors, scope, constraints, and priority, summarises what it heard, and waits for confirmation. There is a hard gate:

> **GATE**: Do NOT proceed past Phase 1 until the user explicitly confirms the captured requirements are correct.

This is the phase that earns its keep. The gate prevents Claude from doing what LLMs love to do: autocomplete the entire spec without checking whether it's autocompleting in the right direction.

Once confirmed, the agent works through user stories with prioritised acceptance criteria, BDD scenarios in Given-When-Then format, a TDD plan with tests ordered by dependency, functional requirements using RFC-2119 language (MUST/SHOULD/MAY), and measurable success criteria. Everything gets assembled into a single Markdown file.

## Traceability

Plan-Spec's central obsession is that every artefact links to the artefact above it and below it:

```
Functional Requirement → User Story → BDD Scenario → Test Name
      FR-003           →   US-2     →  Scenario 2.3 → test_expired_token_rejected
```

Every BDD scenario carries a `Traces to:` line referencing its parent story. Every test maps back to a scenario. Before finishing, the agent runs a checklist: every user story has acceptance scenarios, every scenario has BDD coverage, every BDD scenario maps to a test, every functional requirement appears in the traceability matrix, and every success criterion uses measurable language. "Works correctly" gets rejected. "100% of expired tokens rejected" does not.

## The boundary value catalogue

The skill includes a 201-line reference catalogue of boundary conditions organised by input type. Numeric: zero, min-1, max+1, `0.1 + 0.2`, NaN. Strings: empty, null, max+1, unicode combining characters, `<script>alert(1)</script>`, emoji. Dates: leap year February 29th, DST transitions, `9999-12-31`. Plus categories for concurrency, state corruption, network failures, and resource exhaustion.

The agent consults this for every feature. It doesn't need to remember that non-leap-year February 29th is a meaningful test case -- it's in the catalogue.

## What it produces

A spec for a password reset feature comes out at 366 lines. Three user stories, eleven BDD scenarios, seventeen ordered tests, twenty-seven test data rows across three datasets, ten functional requirements, six success criteria with numeric thresholds, and a complete traceability matrix. The chain runs unbroken from "why are we building this" to "how do we know it's done."

It's a skill, not a compiler -- there's no deterministic guarantee that two runs produce identical output. But the structure is consistent, the traceability checks are systematic, and the output is miles ahead of "here's a plan with some bullet points."

## How it fits with Taskify

Plan-Spec operates upstream of Taskify. Plan-Spec answers "what should we build and how do we test it." Taskify answers "is the task description well-formed enough for an agent to execute," and validates it deterministically against a JSON Schema. You'd use Plan-Spec on Monday to think through the feature, then Taskify on Tuesday to break it into validated, tracked work items.

## The meta-point

Every specification problem is a thinking problem. The agent didn't produce a vague spec because it's incapable of precision -- it produced a vague spec because you asked for a plan and a plan is whatever the agent thinks a plan looks like. Give it a structured process with mandatory traceability, boundary value catalogues, and an explicit gate between discovery and design, and it produces something you'd actually build from.

The fix isn't a smarter model. The fix is a better process -- and the process fits in six Markdown files.
