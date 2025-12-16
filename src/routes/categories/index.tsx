import { useStore } from "@livestore/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { visibleCategories$ } from "../../components/MainSection";

import { Collection } from "react-aria-components";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemExpandButton,
} from "@/components/ui/tree";
import { tables, events } from "@/livestore/schema";
import { queryDb } from "@livestore/livestore";
import { uiState$ } from "@/livestore/queries";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, InfoIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { store } = useStore();
  const { newTodoText } = store.useQuery(uiState$);
  const visibleCategories = store.useQuery(visibleCategories$);

  const updatedNewTodoText = (text: string) =>
    store.commit(events.uiStateSet({ newTodoText: text }));

  const createCategory = () =>
    store.commit(
      events.categoryCreated({
        id: crypto.randomUUID(),
        name: newTodoText,
        color: "#f2f2f2",
      }),
      events.uiStateSet({ newTodoText: "" })
    );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        <p className="text-muted-foreground">Organize your time entries.</p>
      </div>

      <div className="flex gap-2">
        <input
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="New category name..."
          value={newTodoText}
          onChange={(e) => updatedNewTodoText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              createCategory();
            }
          }}
        />
        <Button onClick={createCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="border border-border rounded-lg bg-card p-4">
        <Tree
          className="w-full"
          aria-label="Categories"
          selectionMode="multiple"
          items={visibleCategories.filter((c) => !c.parentId)}
        >
          {function renderItem(item) {
            return <CategoryItem categoryId={item.id} />;
          }}
        </Tree>
      </div>
    </div>
  );
}

function CategoryItem({ categoryId }: { categoryId: string }) {
  const { store } = useStore();
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [childName, setChildName] = useState("");

  const category = store.useQuery(
    queryDb(
      tables.categories.where({ id: categoryId }).first({ behaviour: "error" }),
      { deps: [categoryId] }
    )
  );

  // Only show direct children (one level deep)
  const children = store.useQuery(
    queryDb(
      tables.categories.where({ parentId: categoryId, deletedAt: null }),
      { deps: [categoryId] }
    )
  );

  const createChildCategory = () => {
    if (!childName.trim()) return;
    store.commit(
      events.categoryCreated({
        id: crypto.randomUUID(),
        name: childName.trim(),
        color: category.color,
        parentId: categoryId,
      })
    );
    setChildName("");
    setIsAddingChild(false);
  };

  return (
    <TreeItem textValue={category.name}>
      <TreeItemContent>
        {children.length ? <TreeItemExpandButton /> : null}
        <Checkbox slot="selection" />
        <span className="flex-1">{category.name}</span>
        {/* Only show "Add sub-category" button for root categories (one level deep limit) */}
        {category.parentId === null && (
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingChild(!isAddingChild);
            }}
            title="Add sub-category"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        )}
        <Link
          to="/categories/$categoryId"
          params={{ categoryId }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="ml-auto flex items-center justify-center rounded-md ring-offset-background opacity-0 group-hover:opacity-100 p-1 hover:bg-accent text-muted-foreground hover:text-foreground transition-opacity"
          aria-label="View category details"
        >
          <InfoIcon className="size-4 shrink-0" />
        </Link>
      </TreeItemContent>
      {isAddingChild && (
        <div className="pl-6 py-2 flex gap-2">
          <input
            className="flex h-8 flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Sub-category name..."
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                createChildCategory();
              } else if (e.key === "Escape") {
                setIsAddingChild(false);
                setChildName("");
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={createChildCategory}>
            Add
          </Button>
        </div>
      )}
      {/* Only render children if this is a root category (no parent) - one level deep limit */}
      {category.parentId === null && (
        <Collection items={children}>
          {(item) => <CategoryItem categoryId={item.id} />}
        </Collection>
      )}
    </TreeItem>
  );
}
