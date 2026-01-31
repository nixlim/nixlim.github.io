---
title: "Hive"
description: "Multi-agent orchestration for software development"
status: "experimental"
github: "https://github.com/nixlim/hive"
tech: ["Go", "Claude Code", "Git"]
featured: true
weight: 1
---

Hive coordinates multiple Claude Code agents through a structured hierarchy of roles -- architect, engineer, and reviewer -- to tackle complex software engineering tasks. Instead of a single agent working sequentially, Hive distributes work across a pool of agents, each operating in isolated git worktrees to prevent conflicts.

The architecture revolves around a supervisor process that decomposes high-level objectives into discrete tasks, assigns them to available agents based on role, and manages the integration of completed work back into the main branch. Each agent gets its own worktree and operates independently, with bead-based issue tracking providing the coordination layer.

Hive is currently experimental. The core orchestration loop works, but the challenge lies in the subtleties of multi-agent coordination: handling merge conflicts across worktrees, managing agent context windows efficiently, and knowing when to escalate decisions back to the architect. It's an ongoing exploration of what becomes possible when you treat AI coding agents as a team rather than a solo tool.
