---
title: "Optimising Quote Retrieval: How AQE Finds Better Needles in Academic Haystacks"
date: 2026-02-01
draft: false
tags: ["aqe", "architecture", "llm", "rag", "vibe-coding"]
description: "The search pipeline in Academic Quote Extractor was leaving good quotes on the table. Here's how query expansion and batched scoring fixed the retrieval problem from both ends."
---

<img src="/images/getting_better_quotes.png" alt="Getting better quotes from academic papers">

Academic Quote Extractor has a deceptively simple job: you give it a research topic, it gives you real quotes from real papers with real citations. Under the hood, it's a hybrid RAG pipeline -- Weaviate for retrieval, Claude for relevance scoring, SQLite for ground truth. It worked. The quotes came back correct, the citations were verifiable, and nobody was hallucinating references.

But "correct" and "comprehensive" are different things. The pipeline was leaving good quotes on the table, and it took an audit of the entire search flow to understand why.

## The gaps in the pipeline

When we laid out the current search pipeline and asked "where are quotes getting lost?", the answer was: basically everywhere between the user's topic and Claude's scoring prompt.

| Area | What was happening | What it cost us |
|------|-------------------|-----------------|
| **Query** | User's raw topic string passed verbatim to Weaviate | BM25 depends on keyword overlap. "Impact of social media on political polarization" won't match chunks that say "online platforms" or "partisan divide." Those quotes just vanish. |
| **Alpha** | Hardcoded 0.5 (equal BM25/vector weight) | Probably not optimal for academic text. Vector search tends to outperform keyword search for conceptual queries, but we were giving them equal say. |
| **Fusion** | Default `rankedFusion` | `relativeScoreFusion` normalises scores before combining, which can give better results when BM25 and vector scores are on different scales. |
| **Query expansion** | None. Topic goes straight to Weaviate. | Missing synonym and concept matches entirely. A chunk about "computational linguistics" won't surface for a query about "natural language processing" unless the vector embeddings happen to be close enough -- and `nomic-embed-text` at 137M parameters doesn't catch every semantic relationship. |
| **Scoring capacity** | All candidates crammed into one Claude call | 30 chunks x ~3,200 chars = ~96K characters per prompt. Already substantial. At 100 candidates, that's ~320K characters, and the Claude CLI subprocess ceases to acknowledge the concept of functioning. This hard-caps how many candidates we can even evaluate. |

The first two problems are about *finding* good candidates. The last one is about *evaluating* them. They're complementary failures, and fixing one without the other only gets you halfway.

## Tier 1: Query expansion -- finding quotes that keywords miss

The highest-impact fix turned out to be the simplest conceptually. Before searching Weaviate, make a quick Claude call to expand the user's topic into multiple search-optimised queries:

```
User topic: "programming languages and software engineering"

Claude generates:
  → "programming languages and software engineering" (original)
  → "programming paradigms language design syntax semantics"
  → "software development methodology code quality testing"
```

Then run a Weaviate search for each variant, union the results, and deduplicate by chunk ID. The original query still runs -- you're not replacing it, you're supplementing it. The expanded queries catch the synonym misses that BM25 can't handle and that a 137M-parameter embedding model doesn't always bridge.

Cost: one small Claude call (~$0.01) for expansion, plus 2-3 extra Weaviate searches that are free and local. The retrieval pool goes from "whatever matched your exact keywords plus nearby vectors" to "everything conceptually related to your topic across the entire corpus."

This is where the biggest quality gains live. You can't score a quote Claude never sees.

## Tier 2: Batched scoring -- evaluating all of them without dying

Query expansion surfaces more candidates. Good. But now you've got 60-100 chunks to score, and the prompt size ceiling hasn't moved. This is where batching comes in.

Instead of one massive Claude call, split the candidates into batches of 30 and score each batch independently. Merge the results. Sort by relevance.

The prompt template doesn't change. Search doesn't change. Storage doesn't change. ~70 lines of new Go code, no re-ingestion, no schema changes.

These two improvements work best together. Expansion finds better candidates. Batching evaluates all of them. Attack the problem from both ends.

## The combined flow

The optimised pipeline looks like this:

1. **Claude expands the topic** into 3-4 search queries (~1s, ~$0.01)
2. **Weaviate runs each query**, unions results, deduplicates by chunk ID -- surfaces 60-100 unique candidates instead of 30
3. **Claude scores them in batches of 30** -- evaluates all candidates without OOM
4. **Filter and present** as before -- top quotes, verbatim, with citations

Step 1 ensures you're not missing quotes because of keyword mismatch. Step 3 ensures you can actually evaluate everything step 2 found. Neither alone solves the quality problem; together they cover it.

## The trade-offs

Batching isn't free. Neither is query expansion. Here's the honest accounting:

| Factor | What actually happens |
|--------|---------------------|
| **Cost** | Query expansion adds ~$0.01 per extraction. Batched scoring at 100 candidates = 4 Claude calls instead of 1. Your API bill scales linearly with batch count. Still cheap, but not zero. |
| **Latency** | Expansion adds ~1 second. Batches run sequentially at ~15-20s each. 4 batches = 60-80s total vs ~20s for a single call. The user waits longer. Worth it if the quotes are better. |
| **Score consistency** | Each batch scores independently. A chunk scoring 75 in batch 1 might have scored 70 in batch 2 because it's competing against different neighbours. The LLM's relevance judgments are influenced by what else is in the prompt. In practice, the variance is minor -- a few points -- and the final sort across all batches still surfaces the good stuff. But the scores aren't perfectly comparable across batches. |
| **Failure handling** | If batch 3 of 4 fails, we fail entirely. Partial results from a relevance-ranked pipeline are misleading -- you'd think you got the best quotes, but you only searched 75% of the candidate space. |

## What we didn't do (and why)

Some ideas looked good on paper but weren't worth the complexity:

- **Weaviate reranker module** -- Requires changing the Docker setup and pulling another model. Claude is already doing the reranking externally, and doing it better than a generic reranker would on academic text.
- **BM25 parameter tuning** (k1, b values) -- Marginal gains for the effort. Vector search compensates for BM25's weaknesses, and query expansion addresses the keyword mismatch problem more directly.
- **Document-level filtering** -- A nice scoping feature ("only search this specific paper") but it doesn't improve retrieval quality. It's a UX improvement, not a relevance improvement. Backlog.
- **Alpha tuning + fusion type** -- Changing the BM25/vector weight from 0.5 to maybe 0.6-0.7 (biasing toward vector for semantic queries), and switching from `rankedFusion` to `relativeScoreFusion`. These are one-line changes each. Trivial to implement, but they need experimentation to find optimal values. We'll expose `--alpha` as a CLI flag and let users tune it for their corpus.

## The meta-lesson

Every RAG system hits a scaling wall. The wall is usually not where you expect it. It's not in the vector search (that scales fine). It's not in the embedding generation (that's embarrassingly parallel). It's in two places nobody warns you about: the retrieval query itself, and the scoring prompt that the candidates get stuffed into.

The retrieval query problem is that users write topics in natural language, but search engines -- even hybrid ones -- need help bridging the vocabulary gap. A one-dollar LLM call for query expansion buys you more quality improvement than any amount of BM25 parameter tuning.

The scoring prompt problem is pure arithmetic. More candidates = bigger prompt = dead subprocess. Batching is the obvious fix, with the non-obvious caveat that cross-batch score comparisons are approximate rather than exact.

Fix retrieval to find better candidates. Fix scoring to evaluate more of them. The quotes get better from both directions, and neither change requires re-ingesting your corpus or redesigning your schema. That's the kind of optimisation that makes you wonder why you didn't do it on day one -- which, of course, is what day two is for.
