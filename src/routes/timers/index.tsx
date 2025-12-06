import { createFileRoute } from "@tanstack/react-router";
import { Timeline } from "../../components/Timeline";

export const Route = createFileRoute("/timers/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Timers</h2>
        <p className="text-muted-foreground">Manage and track your active sessions.</p>
      </div>
      <Timeline />
    </div>
  );
}
