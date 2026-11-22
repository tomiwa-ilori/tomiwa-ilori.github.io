---
title: Reading ad images before they run
org: Aylo · Ads Intelligence
period: 2026
order: 4
summary: A CLIP model that predicts how clickable an ad image will be before it runs, and a Moondream2 service that describes and categorizes any ad image.
stack: Python, CLIP, Moondream2, FastAPI, Docker, Streamlit
---

## Two questions about every image

When an advertiser uploads an image, we'd like to know two things before it ever runs: what's in it, and whether people are likely to click it. I built a model for each.

## Predicting clickability

I built an image scoring model using **CLIP** that predicts how clickable an ad image will be before it runs. Its predictions track real click performance closely, especially on high-traffic ads, where the real numbers are most reliable.

That gives the team an early signal on weak creatives, before any budget is spent on them.

## Describing and categorizing

The second piece is a production image-understanding service. You send it an image URL, and it uses **Moondream2**, a small vision-language model, to describe the image and assign it a category automatically.

I chose the model after evaluating candidates on output quality and cost to run. The service runs as a FastAPI app in Docker, and I built a Streamlit demo so the ads team could try their own images before we integrated it.
