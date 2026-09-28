---
title: Threat and misinformation detection
org: Logically
period: 2021–2023
order: 5
summary: Model upgrades to the Logically Intelligence platform that raised threat-detection accuracy by 32%, on MLOps pipelines I ran on GCP.
stack: Python, BERT, DistilRoBERTa, Longformer, HuggingFace, Elasticsearch, Vertex AI, Pub/Sub, Cloud Composer, MLflow, FastAPI, Docker, Terraform
---

## The problem

[Logically Intelligence](https://logically.ai/logically-intelligence) helps government and private-sector analysts find threats and misinformation in large volumes of live news and online content. Missed threats are costly, and so are false alarms that waste an analyst's time.

## What I did

- **Raised threat-detection accuracy by 32%.** I led upgrades to the detection models using ensemble learning and autoencoders.
- **Rebuilt the classification pipelines** on transformer models (BERT, DistilRoBERTa and Longformer), surpassing the previous benchmarks in both precision and latency.
- **Real-time detection.** Model outputs were integrated into Elasticsearch, powering entity and misinformation detection across live news data.
- **Tuning with the people who use it.** I worked directly with threat analysts to set model thresholds that matched their risk tolerance and the false-positive trade-offs they could live with.

## MLOps on GCP

I managed the MLOps pipelines end to end:

- Vertex AI for training and deployment, with Cloud Storage for model artifacts
- Pub/Sub for event-driven triggers and Cloud Composer (Airflow) for orchestration
- MLflow for tracking and versioning experiments
- Moving the serving layer from Flask to async FastAPI for higher-concurrency inference and lower response times
- Docker containers on infrastructure provisioned with Terraform

I also led our sprint cycles in Agile, keeping work visible through Jira and Confluence.
