---
title: "Academic Quote Extractor"
description: "CLI for extracting quotes from academic documents with Harvard citations"
status: "experimental"
github: "https://github.com/nixlim/academic-quote-extractor"
tech: ["Go", "Docker", "Claude", "Weaviate", "SQLite"]
featured: true
weight: 2
---

Academic Quote Extractor (AQE) is a CLI tool built on a hybrid RAG architecture that extracts relevant quotes from academic papers and generates properly formatted Harvard citations. The pipeline operates in three phases: ingest, extract, and export.

The critical design decision is the zero-hallucination guarantee. The LLM (Claude) is never asked to generate or paraphrase quotes. Instead, it only scores the relevance of pre-retrieved passages. Quotes are always retrieved verbatim from SQLite, ensuring every citation traces back to exact source text. This eliminates the most dangerous failure mode of LLM-assisted research: fabricated references.

The tech stack combines Docling for document parsing (handling PDFs, DOCX, and other academic formats), Weaviate for hybrid vector + keyword search, Ollama for local embedding generation, and Claude for relevance scoring. All document text is stored in SQLite as the ground truth source. The result is a tool that feels like magic when it works -- ask a research question and get back real, verified quotes with page numbers and proper citations.
