# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a time-tracker web application built with:
- **LiveStore** - Local-first reactive data store with sync capabilities
- **Effect** - Functional effect system for TypeScript
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Cloudflare Workers** - Sync backend (via `@livestore/sync-cf`)

## Common Commands

```bash
bun dev        # Start development server
bun build      # Build for production
bun test       # Run Playwright tests
bun typecheck  # Type-check with Effect diagnostics
```

## Architecture

- `src/` - Main application source
  - `components/` - React components
  - `livestore/` - LiveStore schema and queries
  - `util/` - Utility functions
  - `cf-worker/` - Cloudflare Worker sync backend
- `tests/` - Playwright E2E tests

<!-- effect-solutions:start -->
## Effect Solutions Usage

The Effect Solutions CLI provides curated best practices and patterns for Effect TypeScript. Before working on Effect code, check if there's a relevant topic that covers your use case.

- `effect-solutions list` - List all available topics
- `effect-solutions show <slug...>` - Read one or more topics
- `effect-solutions search <term>` - Search topics by keyword

**Local Effect Source:** The Effect repository is cloned to `~/.local/share/effect-solutions/effect` for reference. Use this to explore APIs, find usage examples, and understand implementation details when the documentation isn't enough.
<!-- effect-solutions:end -->
