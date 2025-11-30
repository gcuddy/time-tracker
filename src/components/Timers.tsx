import { useStore } from "@livestore/react";
import type React from "react";

import { uiState$ } from "../livestore/queries.ts";
import { events } from "../livestore/schema.ts";
import { visibleCategories$ } from "./MainSection.tsx";

export const Timers: React.FC = () => {
  const { store } = useStore();
  const { newTodoText } = store.useQuery(uiState$);

  const updatedNewTodoText = (text: string) =>
    store.commit(events.uiStateSet({ newTodoText: text }));

  const todoCreated = () =>
    store.commit(
      events.categoryCreated({
        id: crypto.randomUUID(),
        name: newTodoText,
        color: "#f2f2f2",
      }),
      events.uiStateSet({ newTodoText: "" }),
    );

  const visibleCategories = store.useQuery(visibleCategories$);

  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-neutral-800 mb-4">Timers</h1>
      <input
        className="w-full px-4 py-3 text-lg border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-neutral-400"
        placeholder="Add timer"
        value={newTodoText}
        onChange={(e) => updatedNewTodoText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            todoCreated();
          }
        }}
      />
      <div className="mt-4 space-y-2">
        {visibleCategories.map((category) => (
          <div key={category.id} className="px-3 py-2 bg-neutral-100 rounded-md">
            <span className="text-neutral-700">{category.name}</span>
          </div>
        ))}
      </div>
    </header>
  );
};
