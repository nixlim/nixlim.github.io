---
title: "Hive"
description: "What if one AI agent is good, but a whole team of them is chaos you can aim?"
status: "experimental"
github: "https://github.com/nixlim/hive"
tech: ["Go", "Claude Code", "Git"]
featured: true
weight: 1
---

The premise is absurd and therefore worth trying: take multiple Claude Code agents, give them distinct roles -- architect, engineer, reviewer -- and make them collaborate on real software tasks like a dysfunctional but surprisingly productive team.

Hive throws out the assumption that AI coding means one agent, one task, one context window. Instead, there's a supervisor process that breaks objectives into pieces, assigns them to a pool of agents, and lets each one work in its own isolated git worktree. Nobody steps on anyone's toes. Nobody shares a context window. They just... build things in parallel, and somehow it works.

The honest status: experimental. The orchestration loop runs. Agents produce real code. But multi-agent coordination turns out to be exactly as messy as multi-human coordination -- merge conflicts, context drift, and the occasional agent that confidently builds the wrong thing. The difference is you can spin up a new agent in seconds instead of scheduling a meeting about it. The exploration continues because the question "what if AI agents could work as a team?" is too interesting to leave unanswered just because it's hard.
