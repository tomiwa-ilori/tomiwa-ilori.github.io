---
title: A single view of C$1.5B in telecom spend
org: BC Public Service · Ministry of Citizens' Services
period: 2024–2026
order: 6
summary: A data management platform that consolidated telecom spend across 13 public-sector entities and automated reporting that would otherwise have needed 7 more analysts.
stack: Python, AWS S3, Glue, Lambda, Athena, Parquet, Terraform, Power BI
---

## The problem

Telecom spend with Rogers and Telus was spread across thirteen public-sector entities, including BC Hydro and WorkSafeBC. Each month, reporting meant pulling together files in different shapes, and leadership couldn't easily trust that two reports were counting the same thing.

## What I built

I led the implementation of a Data Management Platform covering more than C$1.5 billion in spend.

- **Ingestion.** Python ETL and AWS Glue jobs take the raw telecom data and transform it into Parquet.
- **Event-driven processing.** New files landing in S3 trigger Lambda functions, so data is processed when it arrives rather than when someone remembers to run a job.
- **Infrastructure as code.** The whole pipeline is defined in Terraform, so environments are reproducible.
- **Analytics and reporting.** Athena queries the Parquet data directly, and Power BI dashboards sit on top for executive leadership.

## Outcome

Monthly financial reporting became automated, removing the need to hire **7 additional analysts**, and standardized pipelines meant every report was built the same way. Leadership moved from reconciling inconsistent spreadsheets to one governed, consistent view of spend across the ministry.

## Bringing the team along

I was the only technical member of a team of two. I explained data concepts in plain language and wrote documentation in Confluence, so my colleagues could read the dashboards on their own, raise data issues, and explain spend figures to leadership without me in the room.
