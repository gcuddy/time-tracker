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

<!-- livestore:start -->

## LiveStore

**Local Livestore Source:** The Livestore repository is cloned to `~/.local/share/livestore` for reference. Use this to explore APIs, find usage examples, and understand implementation details when the documentation isn't enough.

### Joining/Relating Data Between Tables

LiveStore uses SQLite under the hood, so you can use raw SQL JOINs to combine data from multiple tables. This is the recommended pattern for resolving foreign keys to their related objects.

#### Pattern: Raw SQL JOIN with `queryDb`

Use `sql` template literal + `queryDb` with a custom schema that extends the base table schema:

```typescript
import { queryDb, Schema, sql } from '@livestore/livestore'
import { tables } from './schema.ts'

// Join events with categories to get category name and color
export const eventsWithCategories$ = queryDb(
  {
    query: sql`
      SELECT 
        events.*,
        categories.name as categoryName,
        categories.color as categoryColor
      FROM events
      LEFT JOIN categories ON events.categoryId = categories.id
      WHERE events.deletedAt IS NULL
      ORDER BY events.startedAt DESC
    `,
    schema: tables.events.rowSchema.pipe(
      Schema.extend(
        Schema.Struct({
          categoryName: Schema.NullOr(Schema.String),
          categoryColor: Schema.NullOr(Schema.String),
        })
      ),
      Schema.Array
    ),
  },
  { label: 'eventsWithCategories' }
)
```

**Key points:**
- Use `LEFT JOIN` when the related entity might not exist (nullable foreign key)
- Use `INNER JOIN` when the related entity must exist
- Extend the base `rowSchema` with `Schema.extend()` to add joined columns
- Use `Schema.NullOr()` for columns that could be null (from LEFT JOIN)
- Always provide a `label` for debugging in devtools

#### Alternative Patterns

1. **Multiple queries + JS filtering** - Fetch both tables separately, combine in JavaScript. Simpler but less efficient for large datasets.

2. **Lookup hook** - Create a reusable hook like `useCategory(categoryId)` for single lookups.

3. **Denormalization** - Store the related name directly on the entity at event time (e.g., store `categoryName` on the event). Trades storage for query simplicity.

See examples in the LiveStore repo:
- `examples/expo-linearlite/src/app/issue-details.tsx` - Complex JOINs with nested JSON
- `examples/cf-chat/src/hooks.ts` - Multiple queries + JS filtering pattern

<!-- livestore:end -->
