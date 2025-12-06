import { useStore } from "@livestore/react";
import { createFileRoute } from "@tanstack/react-router";
import { visibleCategories$ } from "../../components/MainSection";

import { Collection } from "react-aria-components";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemExpandButton,
  TreeItemInfoButton,
} from "@/components/ui/tree";
import { tables, events } from "@/livestore/schema";
import { queryDb } from "@livestore/livestore";
import { uiState$ } from "@/livestore/queries";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
      events.uiStateSet({ newTodoText: "" }),
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
          items={visibleCategories}
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
  const category = store.useQuery(
    queryDb(
      tables.categories.where({ id: categoryId }).first({ behaviour: "error" }),
      { deps: [categoryId] },
    ),
  );

  const children = store.useQuery(
    queryDb(tables.categories.where({ parentId: categoryId }), {
      deps: [categoryId],
    }),
  );

  return (
    <TreeItem textValue={category.name}>
      <TreeItemContent>
        {children.length ? <TreeItemExpandButton /> : null}
        <Checkbox slot="selection" />
        {category.name}
        <TreeItemInfoButton />
      </TreeItemContent>
      <Collection items={children}>
        {(item) => <CategoryItem categoryId={item.id} />}
      </Collection>
    </TreeItem>
  );
}
