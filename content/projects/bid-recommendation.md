---
title: Bid recommendation and an agentic MVP
org: Aylo · Ads Intelligence
period: 2026
order: 1
summary: Recommending the lowest bid that still reaches a target chance of winning an ad auction, and an agent that can explain the recommendation.
stack: Python, XGBoost, ClickHouse, LangGraph, Qwen 2.5, Ollama, FastAPI, Docker, Kubernetes
status: MVP scope defined; win-probability model in development
---

## The question

Advertisers keep asking the same thing: what should I bid? Bid too low and the campaign loses the auctions it needs. Bid too high and it overpays for impressions it would have won anyway.

For the first version I narrowed the question on purpose:

> For this campaign, in this spot, placement and country, what is the lowest bid predicted to reach an 80% chance of winning?

The target (80% here) is a business setting, not something the model decides.

## How it works

The model never outputs a bid directly. It estimates the chance of winning at each possible bid, and a simple rule picks the bid.

1. **Validate the auctions.** Before any modeling, confirm what the data means: whether one impression ID is one auction, whether the highest bid always wins, and whether pricing is first or second price.
2. **Build context features** for campaign, spot, placement, country and time, using only information available before each auction.
3. **Train a win-probability model** (XGBoost) that predicts whether a bid wins in a given context.
4. **Simulate bids.** Score the model at many candidate bids to get a bid response curve for that context.
5. **Pick the lowest bid that meets the target.** This keeps the recommendation easy to explain: "at $0.038 the model expects you to win 80% of these auctions."

Three design rules carry most of the weight:

- **Honest percentages.** Win probabilities are calibrated (isotonic calibration), so 80% means 80%, not just "ranked higher."
- **A higher bid never lowers the chance of winning.** The model is constrained to be monotonic in bid, so the curve can't dip.
- **No peeking at the future.** Features are built point-in-time, and campaigns with little history lean on their spot's average.

## The agentic MVP

In parallel, I built the team's first agentic AI MVP with LangGraph. It is a ReAct agent: the model reads the request, decides which tools to call and in what order, and loops until it can answer. The first version proved the pattern on a triage workflow, running a locally hosted open-source model (Qwen 2.5) behind FastAPI in Docker.

I then designed its extension into bid recommendations, with the agent orchestrating tools that:

- pull auction history for a campaign context from ClickHouse
- score win probability for a set of candidate bids
- apply the target win-rate rule
- log each recommendation and its inputs for monitoring

The point is not to let the LLM choose the bid. The model and the rule do that. The agent's job is to gather the right context, call the right tools, and explain the result in plain language.

## What comes next

| Version | Optimizes for | Adds |
|---|---|---|
| V1 | Winning auctions | Win-probability model and target rule |
| V2 | Clicks | Predicted click-through rate from the existing click model |
| V3 | Value | Conversions, value and cost, so the bid becomes the economically best one |
