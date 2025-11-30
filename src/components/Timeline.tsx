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

  const timerStopped = (eventId: string) =>
    store.commit(
      events.eventEnded({
        endedAt: new Date(),
        eventId,
      }),
    );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {visibleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          onClick={timerStarted}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Timer
        </button>
      </div>

      {runningTimers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
            Running Timers
          </h3>
          {runningTimers.map((timer) => (
            <div
              key={timer.id}
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="text-neutral-700">
                  Category:{" "}
                  {visibleCategories.find((c) => c.id === timer.categoryId)
                    ?.name ?? timer.categoryId}
                </span>
                <span className="text-2xl font-mono font-bold text-green-700">
                  {formatDuration(timer.startedAt, now)}
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Started: {timer.startedAt.toLocaleTimeString()}
              </p>
              <button onClick={() => timerStopped(timer.id)}>Stop</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
