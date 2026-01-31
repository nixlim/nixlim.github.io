---
title: "OpenCode Beads Plugin"
description: "Integrates Beads issue tracking with OpenCode"
status: "active"
github: "https://github.com/nixlim/opencode_beads_plugin"
tech: ["JavaScript", "OpenCode SDK"]
featured: true
weight: 3
---

The OpenCode Beads Plugin bridges the `bd` (beads) CLI issue tracker with OpenCode's plugin system, giving AI coding agents automatic awareness of project issues and workflow context. It's an event-driven integration that hooks into three key moments of an OpenCode session.

On `session.created`, the plugin runs `bd prime` to inject workflow context into the agent's initial prompt -- giving it full awareness of available issues, priorities, and the project's task management conventions. During `session.compacting`, it re-injects this context to prevent loss during context window compression. On `session.idle`, it triggers `bd sync` to ensure issue state stays in sync with git.

The plugin is deliberately minimal. It's a single JavaScript file with no dependencies beyond the OpenCode SDK. Configuration is optional -- it works out of the box if `bd` is available on the system PATH. The design philosophy is that issue tracking should be invisible infrastructure that agents just know about, not something that requires explicit tooling or ceremony.
