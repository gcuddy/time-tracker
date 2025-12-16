import { queryDb, Schema, sql } from "@livestore/livestore";

import { tables } from "./schema.ts";

export const uiState$ = queryDb(tables.uiState.get(), { label: "uiState" });

export const categories$ = queryDb(
  tables.categories.where({ deletedAt: null }),
  { label: "categories" }
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
        })
      ),
      Schema.Array
    ),
  },
  { label: "eventsWithCategories" }
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
        })
      ),
      Schema.Array
    ),
  },
  { label: "runningTimersWithCategory" }
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
          })
        ),
        Schema.Array
      ),
    },
    { label: `categoryWithChildren:${categoryId}` }
  );

/**
 * All non-deleted tags ordered by name.
 */
export const tags$ = queryDb(
  {
    query: sql`
      SELECT * FROM tags
      WHERE deletedAt IS NULL
      ORDER BY name ASC
    `,
    schema: tables.tags.rowSchema.pipe(Schema.Array),
  },
  { label: "tags" }
);

/**
 * Helper query to fetch tags for a single event.
 */
export const tagsForEvent$ = (eventId: string) =>
  queryDb(
    {
      query: sql`
        SELECT tags.*
        FROM tags
        INNER JOIN eventTags ON eventTags.tagId = tags.id
        WHERE eventTags.eventId = ${eventId} AND tags.deletedAt IS NULL
        ORDER BY tags.name ASC
      `,
      schema: tables.tags.rowSchema.pipe(Schema.Array),
    },
    { label: `tagsForEvent:${eventId}` }
  );

/**
 * Events joined with their category data and tags (as JSON array).
 * Uses GROUP BY with JSON_GROUP_ARRAY to aggregate tags per event.
 */
export const eventsWithCategoriesAndTags$ = queryDb(
  {
    query: sql`
      SELECT 
        events.*,
        categories.name as categoryName,
        categories.color as categoryColor,
        COALESCE(
          (SELECT JSON_GROUP_ARRAY(JSON_OBJECT('id', tags.id, 'name', tags.name, 'color', tags.color))
           FROM eventTags
           INNER JOIN tags ON tags.id = eventTags.tagId AND tags.deletedAt IS NULL
           WHERE eventTags.eventId = events.id),
          '[]'
        ) as tagsJson
      FROM events
      LEFT JOIN categories ON events.categoryId = categories.id
      ORDER BY events.startedAt DESC
    `,
    schema: tables.events.rowSchema.pipe(
      Schema.extend(
        Schema.Struct({
          categoryName: Schema.NullOr(Schema.String),
          categoryColor: Schema.NullOr(Schema.String),
          tagsJson: Schema.String,
        })
      ),
      Schema.Array
    ),
  },
  { label: "eventsWithCategoriesAndTags" }
);

/**
 * Type for a tag attached to an event.
 */
export type EventTag = {
  id: string;
  name: string;
  color: string | null;
};

/**
 * Parse the tagsJson field from eventsWithCategoriesAndTags$ into a typed array.
 */
export const parseTagsJson = (tagsJson: string): EventTag[] => {
  try {
    return JSON.parse(tagsJson) as EventTag[];
  } catch {
    return [];
  }
};

/**
 * Get a single category by ID.
 */
export const categoryById$ = (categoryId: string) =>
  queryDb(
    tables.categories
      .where({ id: categoryId, deletedAt: null })
      .first({ behaviour: "error" }),
    { label: `categoryById:${categoryId}`, deps: [categoryId] }
  );

/**
 * Get direct children of a category (one level deep only).
 */
export const categoryChildren$ = (categoryId: string) =>
  queryDb(tables.categories.where({ parentId: categoryId, deletedAt: null }), {
    label: `categoryChildren:${categoryId}`,
    deps: [categoryId],
  });
