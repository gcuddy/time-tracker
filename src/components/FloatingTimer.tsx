import * as React from "react";
import { useQuery, useStore } from "@livestore/react";
import { runningTimersWithCategory$ } from "../livestore/queries";
import { events } from "../livestore/schema";
import { Button } from "./ui/button";
import { CommandPalette } from "./CommandPalette";
import { CreateTimerModal } from "./CreateTimerModal";

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function FloatingTimer() {
  const { store } = useStore();
  const runningTimers = useQuery(runningTimersWithCategory$);
  const runningTimer = runningTimers[0]; // Get most recent running timer

  const [isPaletteOpen, setIsPaletteOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [createInitialName, setCreateInitialName] = React.useState("");
  const [elapsed, setElapsed] = React.useState(0);

  // Update elapsed time every second when timer is running
  React.useEffect(() => {
    if (!runningTimer) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      setElapsed(Date.now() - runningTimer.startedAt.getTime());
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [runningTimer]);

  const handleSelectCategory = (category: {
    id: string;
    name: string;
    color: string;
  }) => {
    // Stop any currently running timer
    if (runningTimer) {
      store.commit(
        events.eventEnded({ endedAt: new Date(), eventId: runningTimer.id })
      );
    }

    // Start new timer
    store.commit(
      events.eventStarted({
        id: crypto.randomUUID(),
        categoryId: category.id,
        startedAt: new Date(),
      })
    );

    setIsPaletteOpen(false);
  };

  const handleCreateNew = (searchText: string) => {
    setCreateInitialName(searchText);
    setIsPaletteOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleCreateTimer = (name: string, color: string) => {
    const categoryId = crypto.randomUUID();

    // Stop any currently running timer
    if (runningTimer) {
      store.commit(
        events.eventEnded({ endedAt: new Date(), eventId: runningTimer.id })
      );
    }

    // Create the category
    store.commit(events.categoryCreated({ id: categoryId, name, color }));

    // Start a timer for the new category
    store.commit(
      events.eventStarted({
        id: crypto.randomUUID(),
        categoryId,
        startedAt: new Date(),
      })
    );

    setIsCreateModalOpen(false);
    setCreateInitialName("");
  };

  const handleStopTimer = () => {
    if (runningTimer) {
      store.commit(
        events.eventEnded({ endedAt: new Date(), eventId: runningTimer.id })
      );
    }
  };

  const handleStartClick = () => {
    setIsPaletteOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/40">
          {runningTimer ? (
            <>
              {/* Timer indicator */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span
                    className="block w-4 h-4 rounded-full ring-2 ring-white/20"
                    style={{
                      backgroundColor: runningTimer.categoryColor || "#888",
                    }}
                  />
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-75"
                    style={{
                      backgroundColor: runningTimer.categoryColor || "#888",
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-100 font-semibold text-sm">
                    {runningTimer.categoryName || "Unnamed Timer"}
                  </span>
                  <span className="text-amber-400 font-mono text-lg font-bold tracking-tight">
                    {formatDuration(elapsed)}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-zinc-700/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleStartClick}
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleStopTimer}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm5-2.25A.75.75 0 0 1 7.75 7h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            </>
          ) : (
            <>
              <span className="text-zinc-400 text-sm font-medium">
                No timer running
              </span>
              <Button
                onPress={handleStartClick}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold px-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 mr-1.5"
                >
                  <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                </svg>
                Start Timer
              </Button>
            </>
          )}
        </div>
      </div>

      <CommandPalette
        isOpen={isPaletteOpen}
        onOpenChange={setIsPaletteOpen}
        onSelectCategory={handleSelectCategory}
        onCreateNew={handleCreateNew}
      />

      <CreateTimerModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateTimer={handleCreateTimer}
        initialName={createInitialName}
      />
    </>
  );
}
