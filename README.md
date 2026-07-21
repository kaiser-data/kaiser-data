<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=28&duration=3000&pause=1000&color=00FF88&center=true&vCenter=true&width=600&lines=Hi%2C+I'm+Martin+%F0%9F%91%8B;AI%2FML+Engineer;Physicist;Hackathon+Builder;Claude+Code+Power+User" alt="Typing SVG" />

### `AI/ML Engineer` · `Physicist` · `Berlin 📍`

Curious mind building production-grade AI, automation, and tools that actually work.<br/>
PhD in Physics. 3+ years in LLMs. 6 hackathon wins in 2025 — now building on that with 2026 wins, podiums & finalist placements.

<br/>

<a href="https://linkedin.com/in/martin-kaiser-ai">
  <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
</a>
<a href="mailto:martinkaiser.bln@gmail.com">
  <img src="https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />
</a>
<img src="https://img.shields.io/badge/Open_to_Collaborations-00C896?style=for-the-badge&logo=handshake&logoColor=white" alt="Open to Collaborations" />

</div>

<br/>

## 🧠 About

```yaml
role:        AI/ML Engineer
location:    Berlin, Germany 🇩🇪
focus:       LLMs · Agents · Automation · Document Processing · Edge AI
status:      Open to projects, collaborations & hackathons
building:    108 public repos across agents, MCP, edge AI & automation
```

<br/>

## 🎯 What I Build

> **Generative AI & LLM applications** — agents, RAG, document pipelines<br/>
> **Agent & MCP tooling** — MCP hubs, A2A messaging, observability, memory stacks<br/>
> **Automation workflows** — n8n, LangGraph, Dify, custom orchestration<br/>
> **Edge & self-hosted AI** — local-first inference across a private device mesh<br/>
> **End-to-end products** — from idea → prototype → production

<br/>

## ✨ Highlights

- 🚀 **108 public repos** spanning agents, MCP tooling, edge AI, ML benchmarking, automation & infra
- 🏆 **6 hackathon wins in 2025** — followed by 2026 wins, podiums & a Top-7 finalist placing
- 🦊 Built **[`kitsune-mcp`](https://github.com/kaiser-data/kitsune-mcp)** — a shape-shifting MCP hub reaching 10,000+ servers at runtime
- 🔭 Built **[`claude-code-langfuse-tracing`](https://github.com/kaiser-data/claude-code-langfuse-tracing)** — full observability for Claude Code sessions
- 📈 **[`github-stars-analyzer`](https://github.com/kaiser-data/github-stars-analyzer)** → **[live demo: hot-repos.netlify.app](https://hot-repos.netlify.app/)** — analyzes GitHub repos to surface trends and map interests across the ecosystem
- ⚙️ Daily-drive the **[ECC](https://github.com/affaan-m/ECC)** agent harness *(230k+ ⭐)* on Claude Code — skills, memory & instincts for research-first, token-efficient development

<br/>

## 🤖 How I Work with Claude Code

Claude Code is my daily driver. I run a **Pro subscription** and squeeze roughly **30× the usual mileage** out of it by spending tokens deliberately — pairing the agent with memory frameworks like **[claude-mem](https://github.com/thedaviddias/claude-mem)** and modern agent harnesses like **[ECC](https://github.com/affaan-m/ECC)** and **superpowers** to reuse context, cut redundant re-reads, and keep long sessions cheap. Effective spend over raw spend.

I instrument my own sessions with [`claude-code-langfuse-tracing`](https://github.com/kaiser-data/claude-code-langfuse-tracing), so these are real numbers from the last 30 days:

<div align="center">

| Traces | Observations | Tokens (30d) | Models in rotation |
|:------:|:------------:|:------------:|:------------------:|
| **1.45K** | **18.4K** | **~1.7B** | Opus 4.8 · Sonnet 5 · Haiku 4.5 · Fable 5 |

</div>

**Things I've shipped for the Claude Code ecosystem:**

- 🦊 [`kitsune-mcp`](https://github.com/kaiser-data/kitsune-mcp) — shape-shifting MCP hub: `shapeshift()` into 10,000+ MCP servers at runtime, one entry point, no restarts
- 🔭 [`claude-code-langfuse-tracing`](https://github.com/kaiser-data/claude-code-langfuse-tracing) — zero-intrusion observability; a Stop hook replays transcripts into Langfuse as backdated, session-grouped traces with token/cost
- 📡 [`claude-A2A-Comm`](https://github.com/kaiser-data/claude-A2A-Comm) — A2A-protocol messaging between Claude Code sessions, local or over a Pi/VPS hub
- 🧰 [`marty-skills`](https://github.com/kaiser-data/marty-skills) · [`kogitsune`](https://github.com/kaiser-data/kogitsune) — personal skills, commands & harness for Claude Code
- 🦸 [`superpowers`](https://github.com/obra/superpowers) — the official Claude Code agent-skills harness (by obra) I build with daily

<br/>

## 🗂️ Selected Projects

<sub>A slice of 108 repos — grouped to show the range.</sub>

**🧩 Agents & LLM apps**
- [`AngebotsBot`](https://github.com/kaiser-data/AngebotsBot) — AI deal scanner: kaufda.de + Qwen VL 32B + Supabase + LangGraph + Chainlit + Telegram
- [`fraudmind`](https://github.com/kaiser-data/fraudmind) — deterministic fraud-hunting over GDPdU audit dossiers; 22 rule families + Cognee knowledge graph, "no number without a source"
- [`carlover`](https://github.com/kaiser-data/carlover) — multi-agent automotive assistant (LangGraph + ADAC data + Featherless AI)
- [`multi-agent-research`](https://github.com/kaiser-data/multi-agent-research) — research automation with LangGraph + Claude + SerpAPI

**⚡ Edge & self-hosted AI**
- [`jetson-headless-inference`](https://github.com/kaiser-data/jetson-headless-inference) — Jetson Orin 8GB headless AI API with model switching & power management
- [`comm-buddy`](https://github.com/kaiser-data/comm-buddy) — local-first meeting analysis: whisperX + pyannote + Ollama across Mac + Jetson over Tailscale
- [`mac-ram-manager`](https://github.com/kaiser-data/mac-ram-manager) · [`cleandrive`](https://github.com/kaiser-data/cleandrive) — zero-dependency macOS system tools

**📊 ML & benchmarking**
- [`featherless-bench`](https://github.com/kaiser-data/featherless-bench) — systematic LLM benchmarking + DeepEval; Pareto frontier, Vision Arena, 19 text models
- [`llm-finetune-kit`](https://github.com/kaiser-data/llm-finetune-kit) — beginner-friendly LLM fine-tuning: 3-line training, web UI, smart defaults
- [`berlin25-eurosat`](https://github.com/kaiser-data/berlin25-eurosat) — federated learning (Flower) on EuroSAT satellite imagery

**🔁 Automation & infra**
- [`inbox-inferno-n8n`](https://github.com/kaiser-data/inbox-inferno-n8n-community-challenge) — AI email agent with LLM-as-judge — scored **20/20**
- [`free-llm-proxy-router`](https://github.com/kaiser-data/free-llm-proxy-router) — Go OpenAI-compatible proxy routing across free-tier providers (Groq, Gemini, OpenRouter, Cerebras…)
- [`aws-terraform-devops-infrastructure`](https://github.com/kaiser-data/aws-terraform-devops-infrastructure) — production-grade AWS VPC architecture with Terraform IaC
- [`kaiser-echo`](https://github.com/kaiser-data/kaiser-echo) — bilingual voice agent with memory (React + Cloudflare Workers)

<br/>

## 🏆 Hackathon Results

**2026** · *wins, podiums & finalist placements*

🥇 **Agentic FinAI Hackathon Berlin** — *Dify Open Track*<br/>
🏆 **AI Agents Hackathon Berlin** — *Blockchain for Good Alliance Bonus Track Winner*<br/>
🥈 **AI Builders Open Claw Hackathon** — *Open Claw*<br/>
🥉 **Needle Hackathon** — *Main Track*<br/>
4️⃣ **Superchat × Needle AI Builder Event** — *Salesbot*<br/>
🏅 **Cognee AI-Memory Hackathon** — *Top 7 Finalist*

**2025** · *6 wins · 8 podiums*

🥇 **ElevenLabs Hackathon** — *n8n Category*<br/>
🥇 **NEAR AI Hackathon** — *Shade AI-Agent*<br/>
🥇 **AI Hardcore Hackathon** — *LLM Prediction*<br/>
🥇 **Masterschool Hackathon** — *SMS-Service*<br/>
🥈 **Distributed AI Hack Berlin** — *Open Track*<br/>
🥈 **IronHack DevOps Hackashow** — *DevOps*

<br/>

## 💡 Tech Stack

**Core**<br/>
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=for-the-badge&logo=postgresql&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

**AI & GenAI**<br/>
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-D97757?style=for-the-badge&logo=anthropic&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-000000?style=for-the-badge&logo=modelcontextprotocol&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)

**Data & Infra**<br/>
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-844FBA?style=for-the-badge&logo=terraform&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

**Edge**<br/>
![NVIDIA Jetson](https://img.shields.io/badge/Jetson_Orin-76B900?style=for-the-badge&logo=nvidia&logoColor=white)
![Raspberry Pi](https://img.shields.io/badge/Raspberry_Pi-A22846?style=for-the-badge&logo=raspberrypi&logoColor=white)
![Tailscale](https://img.shields.io/badge/Tailscale-242424?style=for-the-badge&logo=tailscale&logoColor=white)

<br/>

## 🎭 Beyond Code

🎤 **VP Public Relations** · Toastmasters Club Berliner Rhetorikmeister<br/>
♟️ **Teams Organizer** · Chessclub Weisse Dame e.V. *(200 members)*

<br/>

## 📊 GitHub

<div align="center">

<!-- Reliable badges (always render) -->
<img src="https://komarev.com/ghpvc/?username=kaiser-data&label=Profile+views&color=00ff88&style=for-the-badge" alt="Profile views" />
<img src="https://img.shields.io/github/followers/kaiser-data?style=for-the-badge&logo=github&label=Followers&color=00ff88&labelColor=0d1117" alt="Followers" />
<img src="https://img.shields.io/badge/Public_Repos-108-00ff88?style=for-the-badge&logo=github&labelColor=0d1117" alt="Public repos" />
<img src="https://img.shields.io/badge/Primary-Python_·_TypeScript_·_Go-00ff88?style=for-the-badge&logo=python&logoColor=white&labelColor=0d1117" alt="Languages" />

<br/><br/>

<!--
  All stat cards are STATIC SVGs committed to this repo (never live-rendered),
  so they can't hit the rate limits that broke the old cards:
   - stats-card.svg : custom card, private-inclusive commits/PRs + raw stats
     (no synthetic grade), refreshed daily by .github/workflows/stats-card.yml
     (needs the STATS_TOKEN secret).
   - language donuts : github-profile-summary-cards, theme chartreuse_dark,
     refreshed daily by .github/workflows/profile-summary-cards.yml.
-->

<a href="https://github.com/kaiser-data">
  <img width="78%" alt="Martin Kaiser — GitHub stats & grade" src="https://raw.githubusercontent.com/kaiser-data/kaiser-data/main/assets/stats-card.svg" />
</a>

<br/>

<img height="185" alt="Top languages by repository" src="https://raw.githubusercontent.com/kaiser-data/kaiser-data/main/profile-summary-card-output/chartreuse_dark/1-repos-per-language.svg" />
<img height="185" alt="Top languages by commit" src="https://raw.githubusercontent.com/kaiser-data/kaiser-data/main/profile-summary-card-output/chartreuse_dark/2-most-commit-language.svg" />

</div>
