---
title: Search and data pipelines for Karto
org: HelpSeeker Technologies
period: 2023
order: 6
summary: Automated ingestion for the Karto platform and a document similarity model that made search results more relevant.
stack: Python, Airflow, HuggingFace, NLP, Flask, Kubernetes, Terraform, SQL, NoSQL
---

## The problem

Data for HelpSeeker's Karto platform came from many sources, ingestion was slow and partly manual, and search didn't always surface the most relevant documents.

## What I built

- **Automated ingestion.** Python ETL pipelines replaced manual extraction, improving ingestion speed and reliability.
- **Scheduled, monitored batch jobs** in Airflow, which cut processing delays and the need for someone to watch each run.
- **A document similarity model** using NLP and HuggingFace models, which improved retrieval accuracy and search relevance.
- **Deployment** of the document-matching service with Terraform, Kubernetes and Flask for scalable, low-latency inference.

I also queried large SQL and NoSQL datasets to generate insights that improved model accuracy and coverage.
