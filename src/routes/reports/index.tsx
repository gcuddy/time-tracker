import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@livestore/react";
import { eventsWithCategories$ } from "../../livestore/queries";
import { Duration } from "effect";
import { useMemo } from "react";

export const Route = createFileRoute("/reports/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { store } = useStore();
  const events = store.useQuery(eventsWithCategories$);

  const stats = useMemo(() => {
    const completedEvents = events.filter((e) => e.endedAt !== null);
    const totalTime = completedEvents.reduce((acc, event) => {
      if (event.endedAt) {
        return acc + (event.endedAt.getTime() - event.startedAt.getTime());
      }
      return acc;
    }, 0);

    // Group by category
    const byCategory = new Map<string, { name: string; color: string; time: number; count: number }>();

    completedEvents.forEach((event) => {
      if (event.endedAt) {
        const duration = event.endedAt.getTime() - event.startedAt.getTime();
        const existing = byCategory.get(event.categoryId);

        if (existing) {
          existing.time += duration;
          existing.count += 1;
        } else {
          byCategory.set(event.categoryId, {
            name: event.categoryName ?? "Unknown",
            color: event.categoryColor ?? "#6b7280",
            time: duration,
            count: 1,
          });
        }
      }
    });

    // Sort by time spent (descending)
    const sortedCategories = Array.from(byCategory.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.time - a.time);

    return {
      totalTime,
      totalEvents: completedEvents.length,
      categories: sortedCategories,
    };
  }, [events]);

  const formatDuration = (ms: number) => {
    const dur = Duration.millis(ms);
    const totalSeconds = Duration.toSeconds(dur);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">Analytics and insights for your time tracking.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 bg-card border border-border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Total Time Tracked</div>
          <div className="text-3xl font-bold mt-2">{formatDuration(stats.totalTime)}</div>
        </div>
        <div className="p-6 bg-card border border-border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Completed Sessions</div>
          <div className="text-3xl font-bold mt-2">{stats.totalEvents}</div>
        </div>
      </div>

      {/* Time by Category */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Time by Category</h3>
        {stats.categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
            No completed sessions yet. Start tracking time to see your reports!
          </div>
        ) : (
          <div className="space-y-3">
            {stats.categories.map((category) => {
              const percentage = stats.totalTime > 0
                ? (category.time / stats.totalTime) * 100
                : 0;

              return (
                <div key={category.id} className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.count} session{category.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                    <div className="text-sm font-mono font-semibold min-w-[4rem] text-right">
                      {formatDuration(category.time)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
