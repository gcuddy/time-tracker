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
    <header className="header">
      <h1>Timers</h1>
      <input
        className="new-todo"
        placeholder="Add timer"
        value={newTodoText}
        onChange={(e) => updatedNewTodoText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            todoCreated();
          }
        }}
      />
      {visibleCategories.map((category) => (
        <div key={category.id}>
          <span>{category.name}</span>
        </div>
      ))}
    </header>
  );
};
