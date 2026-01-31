---
title: "Academic Quote Extractor"
description: "Because reading 200 papers manually is a form of cruelty that physics doesn't require."
status: "experimental"
github: "https://github.com/nixlim/academic-quote-extractor"
tech: ["Go", "Docker", "Claude", "Weaviate", "SQLite"]
featured: true
weight: 2
---

Here's a thing that shouldn't need to exist but does: a CLI that reads your academic papers, finds the quotes you actually need, and spits out properly formatted Harvard citations. You ask a research question, it gives you real quotes with real page numbers from real sources. No hallucinated references. No fabricated citations. No "this paper by et al. (2024) that definitely doesn't exist."

The zero-hallucination guarantee is the whole point. The LLM never generates or paraphrases quotes -- it only scores relevance of passages that were already retrieved verbatim from SQLite. Every single citation traces back to exact source text. This exists because the most dangerous thing an LLM can do in academia is make up a reference that sounds plausible, and someone decided that was a solvable problem rather than an acceptable risk.

Under the hood it's a Frankenstein stack that has no business working as well as it does: Docling for parsing PDFs and DOCX files, Weaviate for hybrid vector + keyword search, Ollama for local embeddings, Claude for relevance scoring, and SQLite as the ground truth store. The whole thing runs in Docker because containerizing your chaos is still better than not containerizing it. Ask it a question, get back verified quotes. It feels like magic because it probably is.
