import { createFileRoute } from "@tanstack/react-router";

import { Timeline } from "../components/Timeline.tsx";

export const Route = createFileRoute("/" as const)({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="grow flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Home</h2>
        <p className="text-muted-foreground">Your activity overview.</p>
      </div>
      <Timeline />
    </div>
  );
}
