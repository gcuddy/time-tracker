import { Button } from "@/components/ui/button";
import { useStore } from "@livestore/react";
import type React from "react";
import { useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";

import {
  uiState$,
  eventsWithCategoriesAndTags$,
  tags$,
  parseTagsJson,
  type EventTag,
} from "../livestore/queries.ts";
import { events, tables } from "../livestore/schema.ts";
import { visibleCategories$ } from "./MainSection.tsx";
import { useState, useEffect, useRef } from "react";
import { Duration } from "effect";
import { Tag, X, Plus, Check } from "lucide-react";

type Category = typeof tables.categories.Type;

type HierarchicalCategory = Category & {
  depth: number;
  fullPath: string;
};

/**
 * Build a flat list of categories with depth and full path for hierarchical display.
 */
function buildHierarchicalCategories(
  categories: readonly Category[]
): HierarchicalCategory[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const result: HierarchicalCategory[] = [];

  // Helper to get full path for a category
  const getFullPath = (cat: Category): string => {
    const parts: string[] = [];
    let current: Category | undefined = cat;
    while (current) {
      parts.unshift(current.name);
      current = current.parentId
        ? categoryMap.get(current.parentId)
        : undefined;
    }
    return parts.join(" / ");
  };

  // Helper to get depth
  const getDepth = (cat: Category): number => {
    let depth = 0;
    let current: Category | undefined = cat;
    while (current?.parentId) {
      depth++;
      current = categoryMap.get(current.parentId);
    }
    return depth;
  };

  // Build hierarchical list with children following parents
  const addWithChildren = (cat: Category, depth: number) => {
    result.push({
      ...cat,
      depth,
      fullPath: getFullPath(cat),
    });
    // Find and add children
    const children = categories.filter((c) => c.parentId === cat.id);
    for (const child of children) {
      addWithChildren(child, depth + 1);
    }
  };

  // Start with root categories (no parent)
  const roots = categories.filter((c) => !c.parentId);
  for (const root of roots) {
    addWithChildren(root, 0);
  }

  return result;
}

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
      events.uiStateSet({ newTodoText: "" })
    );

  const visibleCategories = store.useQuery(visibleCategories$);
  const hierarchicalCategories = useMemo(
    () => buildHierarchicalCategories(visibleCategories),
    [visibleCategories]
  );
  const allTimersWithTags = store.useQuery(eventsWithCategoriesAndTags$);
  const allTags = store.useQuery(tags$);
  const [selected, setSelected] = useState<string>();
  const [now, setNow] = useState(() => Date.now());
  const [filterTagIds, setFilterTagIds] = useState<Set<string>>(new Set());

  // Filter timers by selected tags (if any are selected)
  const filteredTimers = useMemo(() => {
    if (filterTagIds.size === 0) return allTimersWithTags;
    return allTimersWithTags.filter((timer) => {
      const timerTags = parseTagsJson(timer.tagsJson);
      return timerTags.some((tag) => filterTagIds.has(tag.id));
    });
  }, [allTimersWithTags, filterTagIds]);

  const toggleFilterTag = useCallback((tagId: string) => {
    setFilterTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  }, []);

  const clearTagFilter = useCallback(() => {
    setFilterTagIds(new Set());
  }, []);

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
      })
    );

  const timerStopped = (eventId: string) =>
    store.commit(
      events.eventEnded({
        endedAt: new Date(),
        eventId,
      })
    );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="h-9 px-3 py-1 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {hierarchicalCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.depth > 0 ? "└ ".repeat(category.depth) : ""}
              {category.name}
            </option>
          ))}
        </select>
        <Button onClick={timerStarted}>Start Timer</Button>
      </div>

      {/* Tag filter controls */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-muted-foreground">
            Filter by tag:
          </span>
          {allTags.map((tag) => {
            const isActive = filterTagIds.has(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleFilterTag(tag.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "ring-2 ring-offset-1 ring-offset-background"
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : "#6b728020",
                  color: tag.color ?? "#6b7280",
                  borderColor: tag.color ?? "#6b7280",
                  ...(isActive && { ringColor: tag.color ?? "#6b7280" }),
                }}
              >
                {tag.name}
                {isActive && <Check className="h-3 w-3" />}
              </button>
            );
          })}
          {filterTagIds.size > 0 && (
            <button
              type="button"
              onClick={clearTagFilter}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {allTimersWithTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Timers
            </h3>
            {filterTagIds.size > 0 && (
              <span className="text-xs text-muted-foreground">
                Showing {filteredTimers.length} of {allTimersWithTags.length}
              </span>
            )}
          </div>
          {filteredTimers.length === 0 && filterTagIds.size > 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              No timers match the selected tags
            </div>
          ) : (
            filteredTimers.map((timer) => {
              const timerTags = parseTagsJson(timer.tagsJson);
              return (
                <TimerCard
                  key={timer.id}
                  timer={timer}
                  timerTags={timerTags}
                  allTags={allTags}
                  categoryPath={
                    hierarchicalCategories.find(
                      (c) => c.id === timer.categoryId
                    )?.fullPath ?? timer.categoryId
                  }
                  now={now}
                  onStop={() => timerStopped(timer.id)}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// Tag colors for visual distinction
const TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

type TimerCardProps = {
  timer: {
    id: string;
    startedAt: Date;
    endedAt: Date | null;
    categoryId: string;
    tagsJson: string;
  };
  timerTags: EventTag[];
  allTags: readonly { id: string; name: string; color: string | null }[];
  categoryPath: string;
  now: number;
  onStop: () => void;
};

const TimerCard: React.FC<TimerCardProps> = ({
  timer,
  timerTags,
  allTags,
  categoryPath,
  now,
  onStop,
}) => {
  const { store } = useStore();
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsEditingTags(false);
      }
    };
    if (isEditingTags) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditingTags]);

  const assignedTagIds = new Set(timerTags.map((t) => t.id));

  const toggleTag = useCallback(
    (tagId: string) => {
      if (assignedTagIds.has(tagId)) {
        store.commit(events.tagRemovedFromEvent({ eventId: timer.id, tagId }));
      } else {
        store.commit(
          events.tagAssignedToEvent({
            id: crypto.randomUUID(),
            eventId: timer.id,
            tagId,
            createdAt: new Date(),
          })
        );
      }
    },
    [store, timer.id, assignedTagIds]
  );

  const createAndAssignTag = useCallback(() => {
    if (!newTagName.trim()) return;
    const tagId = crypto.randomUUID();
    const color =
      TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)] ?? "#6b7280";
    store.commit(
      events.tagCreated({
        id: tagId,
        name: newTagName.trim(),
        color,
        createdAt: new Date(),
      }),
      events.tagAssignedToEvent({
        id: crypto.randomUUID(),
        eventId: timer.id,
        tagId,
        createdAt: new Date(),
      })
    );
    setNewTagName("");
  }, [store, timer.id, newTagName]);

  return (
    <div className="p-4 bg-card border border-border rounded-lg shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <Link
          to="/categories/$categoryId"
          params={{ categoryId: timer.categoryId }}
          className="text-sm font-medium text-foreground hover:text-primary hover:underline transition-colors"
        >
          {categoryPath}
        </Link>
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

      {/* Tags section */}
      <div className="flex flex-wrap gap-1.5 items-center relative">
        {timerTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: tag.color ? `${tag.color}20` : "#6b728020",
              color: tag.color ?? "#6b7280",
              border: `1px solid ${tag.color ?? "#6b7280"}40`,
            }}
          >
            {tag.name}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setIsEditingTags(!isEditingTags)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-dashed border-border"
        >
          <Tag className="h-3 w-3" />
          {timerTags.length === 0 ? "Add tags" : "Edit"}
        </button>

        {/* Tag editor popover */}
        {isEditingTags && (
          <div
            ref={popoverRef}
            className="absolute top-full left-0 mt-2 z-10 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg"
          >
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tags
              </div>
              {/* Existing tags */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {allTags.map((tag) => {
                  const isAssigned = assignedTagIds.has(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-accent text-left text-sm transition-colors"
                    >
                      <span
                        className="inline-flex items-center gap-2"
                        style={{ color: tag.color ?? undefined }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color ?? "#6b7280" }}
                        />
                        {tag.name}
                      </span>
                      {isAssigned && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
                {allTags.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">
                    No tags yet. Create one below.
                  </p>
                )}
              </div>
              {/* Create new tag */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createAndAssignTag();
                  }}
                  placeholder="New tag..."
                  className="flex-1 h-8 px-2 text-sm border border-input rounded bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button size="sm" onClick={createAndAssignTag} className="h-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Started: {timer.startedAt.toLocaleTimeString()}</span>
        {timer.endedAt ? (
          <span>Ended: {timer.endedAt.toLocaleTimeString()}</span>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            className="h-7 px-3"
            onClick={onStop}
          >
            Stop
          </Button>
        )}
      </div>
    </div>
  );
};
