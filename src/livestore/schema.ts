import {
  Events,
  makeSchema,
  Schema,
  SessionIdSymbol,
  State,
} from "@livestore/livestore";

// You can model your state as SQLite tables (https://docs.livestore.dev/reference/state/sqlite-schema)
export const tables = {
  todos: State.SQLite.table({
    name: "todos",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      text: State.SQLite.text({ default: "" }),
      completed: State.SQLite.boolean({ default: false }),
      deletedAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
    },
  }),
  categories: State.SQLite.table({
    name: "categories",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      name: State.SQLite.text({ nullable: false }),
      createdAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
      deletedAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
      color: State.SQLite.text({ nullable: false }),
      parentId: State.SQLite.text({ nullable: true }),
    },
  }),
  events: State.SQLite.table({
    name: "events",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      categoryId: State.SQLite.text({ nullable: false }),
      startedAt: State.SQLite.integer({
        schema: Schema.DateFromNumber,
      }),
      endedAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
      deletedAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
    },
  }),
  tags: State.SQLite.table({
    name: "tags",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      name: State.SQLite.text({ nullable: false }),
      color: State.SQLite.text({ nullable: true }),
      createdAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
      deletedAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
    },
  }),
  eventTags: State.SQLite.table({
    name: "eventTags",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      eventId: State.SQLite.text({ nullable: false }),
      tagId: State.SQLite.text({ nullable: false }),
      createdAt: State.SQLite.integer({
        nullable: true,
        schema: Schema.DateFromNumber,
      }),
    },
  }),
  // Client documents can be used for local-only state (e.g. form inputs)
  uiState: State.SQLite.clientDocument({
    name: "uiState",
    schema: Schema.Struct({
      newTodoText: Schema.String,
      filter: Schema.Literal("all", "active", "completed"),
    }),
    default: { id: SessionIdSymbol, value: { newTodoText: "", filter: "all" } },
  }),
};

// Events describe data changes (https://docs.livestore.dev/reference/events)
export const events = {
  todoCreated: Events.synced({
    name: "v1.TodoCreated",
    schema: Schema.Struct({ id: Schema.String, text: Schema.String }),
  }),
  todoCompleted: Events.synced({
    name: "v1.TodoCompleted",
    schema: Schema.Struct({ id: Schema.String }),
  }),
  todoUncompleted: Events.synced({
    name: "v1.TodoUncompleted",
    schema: Schema.Struct({ id: Schema.String }),
  }),
  todoDeleted: Events.synced({
    name: "v1.TodoDeleted",
    schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.Date }),
  }),
  todoClearedCompleted: Events.synced({
    name: "v1.TodoClearedCompleted",
    schema: Schema.Struct({ deletedAt: Schema.Date }),
  }),
  eventStarted: Events.synced({
    name: "v1.EventStarted",
    schema: Schema.Struct({
      startedAt: Schema.Date,
      categoryId: Schema.String,
      id: Schema.String,
    }),
  }),
  categoryCreated: Events.synced({
    name: "v1.CategoryCreated",
    schema: Schema.Struct({
      name: Schema.String,
      color: Schema.String,
      id: Schema.String,
      parentId: Schema.optional(Schema.NullOr(Schema.String)),
    }),
  }),
  categoryRenamed: Events.synced({
    name: "v1.CategoryRenamed",
    schema: Schema.Struct({ id: Schema.String, name: Schema.String }),
  }),
  categoryColorUpdated: Events.synced({
    name: "v1.CategoryColorUpdated",
    schema: Schema.Struct({ id: Schema.String, color: Schema.String }),
  }),
  categoryDeleted: Events.synced({
    name: "v1.CategoryDeleted",
    schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.Date }),
  }),
  eventEnded: Events.synced({
    name: "v1.EventEnded",
    schema: Schema.Struct({ endedAt: Schema.Date, eventId: Schema.String }),
  }),
  // Tag events
  tagCreated: Events.synced({
    name: "v1.TagCreated",
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      color: Schema.NullOr(Schema.String),
      createdAt: Schema.Date,
    }),
  }),
  tagRenamed: Events.synced({
    name: "v1.TagRenamed",
    schema: Schema.Struct({ id: Schema.String, name: Schema.String }),
  }),
  tagDeleted: Events.synced({
    name: "v1.TagDeleted",
    schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.Date }),
  }),
  tagAssignedToEvent: Events.synced({
    name: "v1.TagAssignedToEvent",
    schema: Schema.Struct({
      id: Schema.String,
      eventId: Schema.String,
      tagId: Schema.String,
      createdAt: Schema.Date,
    }),
  }),
  tagRemovedFromEvent: Events.synced({
    name: "v1.TagRemovedFromEvent",
    schema: Schema.Struct({ eventId: Schema.String, tagId: Schema.String }),
  }),
  uiStateSet: tables.uiState.set,
};

// Materializers are used to map events to state (https://docs.livestore.dev/reference/state/materializers)
const materializers = State.SQLite.materializers(events, {
  "v1.TodoCreated": ({ id, text }) =>
    tables.todos.insert({ id, text, completed: false }),
  "v1.TodoCompleted": ({ id }) =>
    tables.todos.update({ completed: true }).where({ id }),
  "v1.TodoUncompleted": ({ id }) =>
    tables.todos.update({ completed: false }).where({ id }),
  "v1.TodoDeleted": ({ id, deletedAt }) =>
    tables.todos.update({ deletedAt }).where({ id }),
  "v1.TodoClearedCompleted": ({ deletedAt }) =>
    tables.todos.update({ deletedAt }).where({ completed: true }),
  "v1.CategoryCreated": ({ id, color, name, parentId }) =>
    tables.categories.insert({ id, name, color, parentId: parentId ?? null }),
  "v1.CategoryRenamed": ({ id, name }) =>
    tables.categories.update({ name }).where({ id }),
  "v1.CategoryColorUpdated": ({ id, color }) =>
    tables.categories.update({ color }).where({ id }),
  "v1.CategoryDeleted": ({ id, deletedAt }) =>
    tables.categories.update({ deletedAt }).where({ id }),
  "v1.EventStarted": ({ categoryId, startedAt, id }) =>
    tables.events.insert({ categoryId, startedAt, id }),
  "v1.EventEnded": ({ endedAt, eventId }) =>
    tables.events.update({ endedAt }).where({ id: eventId }),
  // Tag materializers
  "v1.TagCreated": ({ id, name, color, createdAt }) =>
    tables.tags.insert({ id, name, color, createdAt }),
  "v1.TagRenamed": ({ id, name }) =>
    tables.tags.update({ name }).where({ id }),
  "v1.TagDeleted": ({ id, deletedAt }) =>
    tables.tags.update({ deletedAt }).where({ id }),
  "v1.TagAssignedToEvent": ({ id, eventId, tagId, createdAt }) =>
    tables.eventTags.insert({ id, eventId, tagId, createdAt }),
  "v1.TagRemovedFromEvent": ({ eventId, tagId }) =>
    tables.eventTags.delete().where({ eventId, tagId }),
});

const state = State.SQLite.makeState({ tables, materializers });

export const schema = makeSchema({ events, state });

// Shared sync payload schema for this example
export const SyncPayload = Schema.Struct({ authToken: Schema.String });
