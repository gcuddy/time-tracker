import { createFileRoute } from "@tanstack/react-router";

import { Timers } from "../components/Timers.tsx";
import { Timeline } from "../components/Timeline.tsx";

export const Route = createFileRoute("/" as const)({
  component: HomePage,
});

function HomePage() {
  return (
    <section className="max-w-2xl mx-auto p-6">
      <Timers />
      <Timeline />
    </section>
  );
}
