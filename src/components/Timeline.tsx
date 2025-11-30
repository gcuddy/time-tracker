import { useStore } from "@livestore/react";
import type React from "react";

import { uiState$ } from "../livestore/queries.ts";
import { events } from "../livestore/schema.ts";
import { runningTimers$, visibleCategories$ } from "./MainSection.tsx";
import { useState, useEffect } from "react";
import { Duration } from "effect";

const formatDuration = (startedAt: Date, now: number) => {
  const dur = Duration.millis(now - startedAt.getTime());
  const totalSeconds = Duration.toSeconds(dur);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
};

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
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
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
          Running for: {formatDuration(timer.startedAt, now)}
        </span>
      ))}
    </div>
  );
};
