# PALM92 Chief of Staff

A local-first project manager prototype: one Chief turns a brief into a short plan, places the work on a board, and keeps the human in charge of consequential actions.

## What works in this prototype

- Python standard-library server bound to `127.0.0.1` only.
- Planning through the local Ollama API, with Qwen as the default model (`qwen2.5:7b`).
- Persistent local JSON state for projects and tasks.
- Four reviewable board stages, plus Blocked.
- No shell execution, outbound messaging, account connectors, or publishing.
- Prompts are not written to request logs.

## Run it on the computer that runs Ollama

1. Install Python 3.10+ and Ollama. Pull a model that fits the machine, for example `ollama pull qwen2.5:7b`.
2. From this directory run `python3 server.py`.
3. Open `http://127.0.0.1:8765` in a browser on that same computer.
4. To select another Ollama model: `OLLAMA_MODEL=qwen3:8b python3 server.py`.

The server never binds to a public network interface. Keep the browser on the same device. Model planning needs enough RAM for the selected model. Ollama is not present in the remote build workspace used to prepare this prototype, so its real model call remains unverified here.

## Design boundary

This is a prototype board, not an autonomous agent swarm. Role labels identify the kind of work a task needs; the prototype does not secretly launch external agents. A later version can add supported connectors and isolated workers after defining permissions, authentication, data retention, and audit records. Claude/OpenAI consumer subscriptions are not automatically API credentials; a supported local CLI or API path would need separate implementation and verification.

## Workflow contract

`Request → Plan → Assign → Review → Human approval → Action → Evidence`

Only the first three stages are implemented here. The board makes review visible; no consequential action is automatic.
