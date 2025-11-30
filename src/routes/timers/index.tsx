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
import { tables } from "@/livestore/schema";
import { queryDb } from "@livestore/livestore";
import { Cat } from "lucide-react";

export const Route = createFileRoute("/timers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { store } = useStore();

  const visibleCategories = store.useQuery(visibleCategories$);

  return (
    <div>
      <Tree
        className="w-[250px]"
        aria-label="Files"
        selectionMode="multiple"
        items={visibleCategories}
      >
        {function renderItem(item) {
          return <CategoryItem categoryId={item.id} />;
          // return (
          //   <TreeItem textValue={item.name}>
          //     <TreeItemContent>
          //       {item.children.length ? <TreeItemExpandButton /> : null}
          //       <Checkbox slot="selection" />
          //       {item.name}
          //       <TreeItemInfoButton />
          //     </TreeItemContent>
          //     <Collection items={item.children}>{renderItem}</Collection>
          //   </TreeItem>
          // );
        }}
      </Tree>
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
