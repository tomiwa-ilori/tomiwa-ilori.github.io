---
title: Click prediction at ad-traffic scale
org: Aylo · Ads Intelligence
period: 2026
order: 2
summary: XGBoost click-prediction models trained across billions of ad impressions, with calibration and a model promotion workflow, served on Kubernetes.
stack: Python, XGBoost, ClickHouse, GCS, Kubernetes, CI/CD, Prometheus, Jaeger
---

## The problem

Ad traffic at this volume needs a reliable estimate of how likely an impression is to be clicked. That estimate feeds decisions downstream, so it has to be accurate as a probability, not just good at ranking.

## What I built

- **Training pipelines** that pull impression and click data from ClickHouse and train XGBoost models across billions of ad impressions.
- **Probability calibration**, so a predicted 2% click rate really behaves like 2% when you look at the traffic it was applied to.
- **A model promotion workflow.** New models are versioned in GCS and only replace the current one once they pass checks, so a bad retrain doesn't reach production.

## Running it in production

I led the move of our ML services onto Kubernetes. That meant adding CI/CD so changes ship the same way every time, model versioning so we always know which model is serving, and Prometheus and Jaeger so we can see latency, errors and request traces when something slows down.

## Why it matters beyond clicks

The click model is also the second stage of the [bid recommendation system](bid-recommendation.html). Once we know the lowest bid that wins, predicted clicks let us move from "win the auction" to "win the auctions that are worth winning."
