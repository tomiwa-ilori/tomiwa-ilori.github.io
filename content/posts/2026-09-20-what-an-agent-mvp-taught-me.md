---
title: What building an agent MVP taught me
date: 2026-09-20
summary: Picking a framework you can explain, choosing a model you can legally ship, and noticing when you don't need an LLM at all.
tags: agentic AI, LangGraph, LLMs
---

I recently built our team's first agentic AI MVP. It's a small service: a request comes in, an LLM reasons about it, calls a few tools, and returns a decision with an explanation. Small as it is, it made me revisit a few assumptions.

## Pick the framework whose abstraction matches the code

I've used LangGraph, CrewAI and AutoGen before, and it was tempting to combine them. I didn't. For a single agent behind a REST API, the question was simple: does the framework's model of the world match what the code actually does?

LangGraph did. The service is a graph: state flows into an agent node, the agent either calls tools or finishes, and tool results flow back to the agent. That loop is the whole program, and it's easy to explain to someone else. CrewAI would have meant writing a role, goal and backstory for a crew of one. AutoGen is built for agents talking to each other, which this wasn't.

## Choose a model you can actually ship

I started with Llama 3.2 3B and switched to Qwen 2.5 3B. Two reasons. Qwen is released under Apache 2.0, while Llama's license has conditions that matter for a company at scale. And Qwen was more reliable at calling tools with valid arguments, which is most of what an agent does.

Both run locally through Ollama, so no data leaves our infrastructure. I set the temperature to 0, because the same request reviewed twice should reach the same decision.

## Tool descriptions are instructions

The LLM never reads your Python. It reads the tool's name, its arguments and its docstring, and decides from those when to call it. So I stopped writing docstrings for developers and started writing them as precise instructions to the model: when to use this tool, what each argument means, what comes back.

## If the caller already knows the answer, you don't need an LLM

My first version had a design flaw I only caught once it was running. The API asked the caller to send the category of the content and the flags that applied to it. But if the caller already knows those, the decision is mostly a lookup. The LLM was adding cost and latency for nothing.

I changed the input to just the raw content. Now the model has to do the real work: read it, classify it, work out which rules apply, and call the tools to check. That's the point of using an agent.

## What's next

The same pattern is now shaping how we bring LLM tooling into bid recommendations. There, the agent's job isn't to choose the bid. A model and a clear rule do that. The agent gathers the right context, calls the right tools, and explains the result in plain language.
