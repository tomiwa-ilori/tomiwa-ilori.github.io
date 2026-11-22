---
title: Bid recommendation
org: Aylo · Ads Intelligence
period: 2026
order: 2
summary: Telling an advertiser the lowest bid they need to win a target share of auctions, built on what our bid tracking revealed.
stack: Python, XGBoost, ClickHouse, FastAPI, Kubernetes
status: Designed
---

## The question

Advertisers keep asking the same thing: what should I bid? Our [bid tracking](bid-tracking.html) had already shown that some advertisers were paying for wins they would have had at a lower bid.

For the first version I narrowed the question on purpose:

> For this campaign, in this spot, placement and country, what is the lowest bid that still wins a target share of auctions, say 80%?

The target is a business setting, not something the model decides.

## How it works

The model never outputs a bid directly. It estimates the chance of winning at each possible bid, and a simple rule picks the bid.

1. **Validate the auctions.** Before any modeling, confirm what the data means: whether one impression ID is one auction, whether the highest bid always wins, and whether pricing is first or second price.
2. **Build context features** for campaign, spot, placement, country and time, using only information available before each auction.
3. **Train a win-probability model** (XGBoost) that predicts whether a bid wins in a given context.
4. **Simulate bids.** Score the model at many candidate bids to get a win-rate curve for that context.
5. **Pick the lowest bid that meets the target.** This keeps the recommendation easy to explain: "at this bid the model expects you to win 80% of these auctions."

Three design rules carry most of the weight:

- **Honest percentages.** Win probabilities are calibrated, so 80% means 80%, not just "ranked higher."
- **A higher bid never lowers the chance of winning.** The model is constrained to be monotonic in bid, so the curve can't dip.
- **No peeking at the future.** Features are built point-in-time, and campaigns with little history lean on their spot's average.

## What comes next

| Version | Optimizes for | Adds |
|---|---|---|
| V1 | Winning auctions | Win-probability model and target rule |
| V2 | Clicks | Predicted click-through rate from the [click-prediction model](click-prediction.html) |
| V3 | Value | Conversions, value and cost, so the bid becomes the economically best one |
