import { useQuery, useStore } from "@livestore/react";
import { runningTimers$ } from "./MainSection";
import { Button } from "./ui/button";

export function FloatingTimer() {
  const { store } = useStore();
  const [runningTimer] = useQuery(runningTimers$);
  return (
    <div className="p-4 flex justify-between items-center">
      {runningTimer ? (
        <div>{runningTimer.id}</div>
      ) : (
        <span>No timer running</span>
      )}
      <Button>Start</Button>
    </div>
  );
}
