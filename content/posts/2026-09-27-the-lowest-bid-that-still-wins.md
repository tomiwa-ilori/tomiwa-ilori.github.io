---
title: The lowest bid that still wins
date: 2026-09-27
summary: Why I don't let the model pick the bid, and the three rules that make a bid recommendation trustworthy.
tags: machine learning, advertising, system design
---

Every advertiser eventually asks the same question: what should I bid?

It sounds like something you'd train a model to answer directly. Feed in the campaign, the placement, the country, and get a number out. I've been designing a bid recommendation system for our Ads Intelligence team, and the most useful decision I made early on was not to do that.

## Narrow the question first

"Optimal bid" can mean a lot of things. The bid that maximizes clicks? Conversions? Profit? Each of those needs data we don't have cleanly joined yet. So for the first version I asked something smaller:

> For this campaign, in this spot, placement and country, what is the lowest bid predicted to reach an 80% chance of winning?

That question has a clear answer, and it's still useful. It tells an advertiser how much they can bid without overpaying for auctions they would have won anyway. The 80% is a business setting, not something the model chooses.

## Let the model estimate, let a rule decide

Instead of predicting a bid, the model predicts the chance of winning at a given bid. Then we ask it about many candidate bids and draw the curve. For example, at $0.02 you win 30% of the time, at $0.03 you win 65%, at $0.038 you cross 80%.

The recommendation is simply the first bid on that curve that clears the target.

This split does two things. It keeps the model's job narrow and testable, and it makes the answer easy to explain. "The model expects you to win 80% of these auctions at $0.038" is something a person can check and argue with. A bid produced directly by a model is much harder to question.

## Three rules that make it trustworthy

**Honest percentages.** A model can rank bids well and still be wrong about the actual probabilities. If the curve says 80%, it needs to mean 80%, so the predictions are calibrated before we read anything off them.

**A higher bid never lowers your chance of winning.** Real data is noisy, and an unconstrained model can learn a curve that dips. That would produce absurd advice, so the model is constrained to be monotonic in the bid.

**No peeking at the future.** Every feature has to be built from what was known before the auction happened. It's easy to leak future information into historical features and get a model that looks brilliant offline and fails in production. Campaigns with little history lean on the average for their spot instead.

## Check the data before the model

The part that took longest had nothing to do with modeling. Before training anything, we have to be sure what an auction is in our data. Does one impression ID mean one auction? Does the highest bid always win? Is it first-price or second-price? Each answer changes what "winning" means, and a model trained on the wrong definition will be confidently wrong.

## Where it goes next

Winning auctions is the first step. The next version adds predicted clicks, so we can prefer auctions worth winning. After that come conversions, value and cost, which is where the recommended bid becomes the economically best bid rather than just the cheapest way to win.
