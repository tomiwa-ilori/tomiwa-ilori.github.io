---
title: Who's winning our auctions
org: Aylo · Ads Intelligence
period: 2026
order: 1
summary: A daily bid tracking pipeline that shows, for every ad bid, whether it won or lost and by how much, and changed how the team thinks about bid pricing.
stack: ClickHouse, Airflow, SQL, Python, Power BI
---

## The question

Advertisers lose auctions, and it wasn't easy to see why, because there was no daily view of which bids won, which lost, and who beat them.

## What I built

A daily pipeline in ClickHouse, scheduled with Airflow, that records for every ad bid:

- whether it won or lost
- who beat it, and by how much
- broken down by campaign and city

The product team now uses it in Power BI to guide bid pricing decisions.

## What the data showed

The first analysis showed where advertisers were paying more than they needed to win, and changed how the team thinks about bid pricing.

## What it led to

The tracking data is the foundation of the [bid recommendation system](bid-recommendation.html), which tells an advertiser the lowest bid they need to win a target share of auctions. Without a trustworthy record of who wins and why, a recommendation would have nothing to stand on.
