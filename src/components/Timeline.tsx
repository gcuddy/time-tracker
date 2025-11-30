import { useStore } from "@livestore/react";
import type React from "react";

import { uiState$ } from "../livestore/queries.ts";
import { events } from "../livestore/schema.ts";
import { runningTimers$, visibleCategories$ } from "./MainSection.tsx";
import { useState } from "react";
import { DateTime, Duration } from "effect";

export const Timeline: React.FC = () => {
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
  const runningTimers = store.useQuery(runningTimers$);
  const [selected, setSelected] = useState<string>();
  console.log({ selected });

  const timerStarted = () =>
    store.commit(
      events.eventStarted({
        categoryId: selected!,
        id: crypto.randomUUID(),
        startedAt: new Date(),
      }),
    );

  return (
    <div>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        {visibleCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <button onClick={timerStarted}>start timer</button>
      running timers:
      {runningTimers.map((timer) => (
        <span key={timer.id}>
          Timer running: {timer.categoryId}
          Started: {timer.startedAt.toISOString()}
          Running for:{" "}
          {Duration.millis(
            DateTime.distance(
              DateTime.unsafeFromDate(timer.startedAt),
              DateTime.unsafeNow(),
            ),
          ).pipe(Duration.format)}
        </span>
      ))}
    </div>
  );
};
