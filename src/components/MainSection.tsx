import { queryDb } from "@livestore/livestore";
import { useStore } from "@livestore/react";
import React from "react";

import { uiState$ } from "../livestore/queries.ts";
import { events, tables } from "../livestore/schema.ts";

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
            className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg group"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
              className="w-5 h-5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
            />
            <span
              className={`flex-1 ${todo.completed ? "line-through text-neutral-400" : "text-neutral-800"}`}
            >
              {todo.text}
            </span>
            <button
              type="button"
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
              onClick={() =>
                store.commit(
                  events.todoDeleted({ id: todo.id, deletedAt: new Date() }),
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
