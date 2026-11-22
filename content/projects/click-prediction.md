---
title: Faster, sharper click prediction
org: Aylo · Ads Intelligence
period: 2026
order: 3
summary: A more accurate click-prediction model, and a faster serving stack with more capacity, for high-volume ad traffic.
stack: Python, XGBoost, ONNX Runtime, FastAPI, Kubernetes, ClickHouse, GCS
---

## The problem

Every ad impression needs an estimate of how likely it is to be clicked. At this volume, the model has to be both accurate and fast: a small gain in accuracy changes which ads people see, and a small gain in speed changes how much hardware the service needs.

## A better model

I improved the XGBoost click-prediction model and raised its AUC. In plain terms, the model got noticeably better at telling apart the impressions that will be clicked from the ones that won't.

## A faster service

I also reworked how the model is served:

- **ONNX Runtime** for inference
- **Async FastAPI** endpoints, so the service handles many requests at once instead of waiting on each one
- running on **Kubernetes**

The result is a noticeably faster service that can handle more traffic.

## Why it matters beyond clicks

The click model is also the second stage of the [bid recommendation system](bid-recommendation.html). Once we know the lowest bid that wins, predicted clicks let us move from "win the auction" to "win the auctions that are worth winning."
