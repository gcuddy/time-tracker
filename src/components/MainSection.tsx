import { queryDb } from "@livestore/livestore";
import { useStore } from "@livestore/react";
import React from "react";

import { uiState$ } from "../livestore/queries.ts";
import { events, tables } from "../livestore/schema.ts";
import { Button } from "./ui/button.tsx";
import { Trash2 } from "lucide-react";

const visibleTodos$ = queryDb(
  (get) => {
    const { filter } = get(uiState$);
    return tables.todos.where({
      deletedAt: null,
      completed: filter === "all" ? undefined : filter === "completed",
    });
  },
  { label: "visibleTodos" },
);

export const visibleCategories$ = queryDb(
  (get) => {
    return tables.categories.where({
      deletedAt: null,
    });
  },
  { label: "visibleTodos" },
);

export const allTimers$ = queryDb(
  (get) => {
    return tables.events.orderBy("startedAt", "desc");
  },
  { label: "runningTimers" },
);

export const runningTimers$ = queryDb(
  (get) => {
    return tables.events.where("endedAt", "=", null);
  },
  { label: "runningTimers" },
);

export const completedTimers$ = queryDb(
  (get) => {
    return tables.events
      .where("endedAt", "!=", null)
      .orderBy("endedAt", "desc");
  },
  { label: "completedTimers" },
);

export const MainSection: React.FC = () => {
  const { store } = useStore();

  const toggleTodo = React.useCallback(
    ({ id, completed }: typeof tables.todos.Type) =>
      store.commit(
        completed
          ? events.todoUncompleted({ id })
          : events.todoCompleted({ id }),
      ),
    [store],
  );

  const visibleTodos = store.useQuery(visibleTodos$);

  return (
    <section className="mt-4">
      <ul className="space-y-2">
        {visibleTodos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg group hover:border-accent transition-colors"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
              className="w-4 h-4 rounded border-input text-primary focus:ring-ring bg-transparent"
            />
            <span
              className={`flex-1 text-sm ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {todo.text}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() =>
                store.commit(
                  events.todoDeleted({ id: todo.id, deletedAt: new Date() }),
                )
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
};
