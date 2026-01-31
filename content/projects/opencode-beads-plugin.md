---
title: "OpenCode Beads Plugin"
description: "Teaching AI agents about their own todo list so you don't have to keep repeating yourself."
status: "active"
github: "https://github.com/nixlim/opencode_beads_plugin"
tech: ["JavaScript", "OpenCode SDK"]
featured: true
weight: 3
---

The problem is dumb and the solution is elegant: AI coding agents have no memory of your project's issues, tasks, or priorities unless you manually paste them in every single time. That's the kind of tedious, repetitive work that computers were literally invented to eliminate. So this plugin eliminates it.

It hooks into three moments of an OpenCode session. When a session starts, it runs `bd prime` and injects the full project context -- open issues, priorities, workflow conventions -- straight into the agent's prompt. When context gets compacted, it re-injects so nothing gets lost. When the session goes idle, it syncs issue state back to git. The agent just *knows* what needs doing without you having to explain it again.

The whole thing is one JavaScript file. No dependencies beyond the OpenCode SDK. Zero configuration required if `bd` is on your PATH. It works by being so invisible you forget it's there -- which is exactly how infrastructure should behave. Issue tracking shouldn't be a ceremony. It should be something the machine handles while you think about the actual problem.
