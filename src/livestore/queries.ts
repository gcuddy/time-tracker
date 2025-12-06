import { queryDb, Schema, sql } from "@livestore/livestore";

import { tables } from "./schema.ts";

export const uiState$ = queryDb(tables.uiState.get(), { label: "uiState" });

export const categories$ = queryDb(
  tables.categories.where({ deletedAt: null }),
  { label: "categories" },
);

/**
 * Events joined with their category data (name, color).
 * Uses SQL LEFT JOIN to resolve the categoryId foreign key.
 */
export const eventsWithCategories$ = queryDb(
  {
    query: sql`
      SELECT 
        events.*,
        categories.name as categoryName,
        categories.color as categoryColor
      FROM events
      LEFT JOIN categories ON events.categoryId = categories.id
      ORDER BY events.startedAt DESC
    `,
    schema: tables.events.rowSchema.pipe(
      Schema.extend(
        Schema.Struct({
          categoryName: Schema.NullOr(Schema.String),
          categoryColor: Schema.NullOr(Schema.String),
        }),
      ),
      Schema.Array,
    ),
  },
  { label: "eventsWithCategories" },
);

/**
 * Running timers (events without endedAt) joined with their category data.
 * Used by FloatingTimer to display running timer info with category name/color.
 */
export const runningTimersWithCategory$ = queryDb(
  {
    query: sql`
      SELECT 
        events.*,
        categories.name as categoryName,
        categories.color as categoryColor
      FROM events
      LEFT JOIN categories ON events.categoryId = categories.id
      WHERE events.endedAt IS NULL
      ORDER BY events.startedAt DESC
    `,
    schema: tables.events.rowSchema.pipe(
      Schema.extend(
        Schema.Struct({
          categoryName: Schema.NullOr(Schema.String),
          categoryColor: Schema.NullOr(Schema.String),
        }),
      ),
      Schema.Array,
    ),
  },
  { label: "runningTimersWithCategory" },
);

/**
 * Get a category with its children by parent ID.
 * Uses a self-join to fetch the parent category and all its direct children.
 */
export const categoryWithChildren$ = (categoryId: string) =>
  queryDb(
    {
      query: sql`
        SELECT 
          parent.*,
          children.id as childId,
          children.name as childName,
          children.color as childColor,
          children.createdAt as childCreatedAt,
          children.deletedAt as childDeletedAt
        FROM categories as parent
        LEFT JOIN categories as children ON children.parentId = parent.id AND children.deletedAt IS NULL
        WHERE parent.id = ${categoryId} AND parent.deletedAt IS NULL
      `,
      schema: tables.categories.rowSchema.pipe(
        Schema.extend(
          Schema.Struct({
            childId: Schema.NullOr(Schema.String),
            childName: Schema.NullOr(Schema.String),
            childColor: Schema.NullOr(Schema.String),
            childCreatedAt: Schema.NullOr(Schema.DateFromNumber),
            childDeletedAt: Schema.NullOr(Schema.DateFromNumber),
          }),
        ),
        Schema.Array,
      ),
    },
    { label: `categoryWithChildren:${categoryId}` },
  );
