import { queryDb, Schema, sql } from '@livestore/livestore'

import { tables } from './schema.ts'

export const uiState$ = queryDb(tables.uiState.get(), { label: 'uiState' })

export const categories$ = queryDb(
  tables.categories.where({ deletedAt: null }),
  { label: 'categories' }
)

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
