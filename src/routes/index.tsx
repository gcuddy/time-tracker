import { createFileRoute } from "@tanstack/react-router";

import { Timers } from "../components/Timers.tsx";
import { Timeline } from "../components/Timeline.tsx";

export const Route = createFileRoute("/" as const)({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="grow flex flex-col h-full">
      <Timers />
      <Timeline />
    </div>
  );
}
