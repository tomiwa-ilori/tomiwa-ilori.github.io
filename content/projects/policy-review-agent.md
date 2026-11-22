---
title: An agent that reviews ad content
org: Aylo · Ads Intelligence
period: 2026
order: 5
summary: The team's first agentic AI system, a LangGraph assistant on an open-source LLM that reviews ad content against policy and recommends approve, reject or escalate.
stack: Python, LangGraph, Qwen 2.5, Ollama, FastAPI, Docker
---

## Why an agent

Reviewing ad content against policy takes judgment: read the content, work out which rules apply, check the history, and decide. That made it a good first project for introducing agentic AI to the team, where the model decides which steps to take rather than following a fixed script.

## How it works

The assistant is a **ReAct** agent built with **LangGraph**. It reads the submission, reasons about it, and calls tools until it has enough to decide:

- look up the policy rules that apply
- check the content's history
- assess how severe any issue is
- record the decision for audit

It then recommends **approve, reject or escalate**, with a plain-language explanation of why.

## Choices that mattered

- **An open-source model run locally.** It runs on **Qwen 2.5** through Ollama, so no content leaves our infrastructure. I moved to Qwen from Llama because of its Apache 2.0 license and more reliable tool calling.
- **Consistent decisions.** Temperature is set to 0, so the same submission reviewed twice reaches the same decision.
- **Make the model do the real work.** My first version asked callers to send the content's category and flags. If the caller already knows those, the LLM adds cost and nothing else, so I changed the input to just the raw content and let the agent classify it.

I wrote more about these lessons in [What building an agent MVP taught me](../blog/what-an-agent-mvp-taught-me.html).
