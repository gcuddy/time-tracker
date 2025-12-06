import { Button } from "@/components/ui/button";
import { useStore } from "@livestore/react";
import type React from "react";

import { uiState$ } from "../livestore/queries.ts";
import { events } from "../livestore/schema.ts";
import {
  allTimers$,
  runningTimers$,
  visibleCategories$,
} from "./MainSection.tsx";
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
  const allTimers = store.useQuery(allTimers$);
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
          className="h-9 px-3 py-1 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {visibleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button onClick={timerStarted}>Start Timer</Button>
      </div>

      {allTimers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Timers
          </h3>
          {allTimers.map((timer) => (
            <div
              key={timer.id}
              className="p-4 bg-card border border-border rounded-lg shadow-sm flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  {visibleCategories.find((c) => c.id === timer.categoryId)
                    ?.name ?? timer.categoryId}
                </span>
                {timer.endedAt ? (
                  <span className="text-lg font-mono font-bold text-muted-foreground">
                    {formatDuration(timer.startedAt, timer.endedAt.getTime())}
                  </span>
                ) : (
                  <span className="text-lg font-mono font-bold text-amber-500">
                    {formatDuration(timer.startedAt, now)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  Started: {timer.startedAt.toLocaleTimeString()}
                </span>
                {timer.endedAt ? (
                  <span>Ended: {timer.endedAt.toLocaleTimeString()}</span>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 px-3"
                    onClick={() => timerStopped(timer.id)}
                  >
                    Stop
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
