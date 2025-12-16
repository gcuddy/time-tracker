import { useStore } from "@livestore/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { queryDb } from "@livestore/livestore";
import { tables, events } from "@/livestore/schema";
import { categoryById$, categoryChildren$ } from "@/livestore/queries";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/categories/$categoryId")({
  component: RouteComponent,
});

// Preset colors for quick selection
const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f2f2f2", // light gray
  "#6b7280", // gray
];

function RouteComponent() {
  const { categoryId } = Route.useParams();
  const { store } = useStore();
  const category = store.useQuery(categoryById$(categoryId));
  const children = store.useQuery(categoryChildren$(categoryId));
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(category.name);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(category.color);

  const updateName = useCallback(() => {
    if (editedName.trim() && editedName !== category.name) {
      store.commit(events.categoryRenamed({ id: categoryId, name: editedName.trim() }));
    }
    setIsEditingName(false);
  }, [store, categoryId, editedName, category.name]);

  const updateColor = useCallback(
    (color: string) => {
      store.commit(events.categoryColorUpdated({ id: categoryId, color }));
      setShowCustomColorPicker(false);
    },
    [store, categoryId]
  );

  const createSubcategory = useCallback(() => {
    if (!newSubcategoryName.trim()) return;
    store.commit(
      events.categoryCreated({
        id: crypto.randomUUID(),
        name: newSubcategoryName.trim(),
        color: category.color,
        parentId: categoryId,
      })
    );
    setNewSubcategoryName("");
    setIsAddingSubcategory(false);
  }, [store, categoryId, category.color, newSubcategoryName]);

  const deleteSubcategory = useCallback(
    (subcategoryId: string) => {
      if (confirm("Are you sure you want to delete this subcategory?")) {
        store.commit(
          events.categoryDeleted({
            id: subcategoryId,
            deletedAt: new Date(),
          })
        );
      }
    },
    [store]
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Category Details</h2>
          <p className="text-muted-foreground">Manage category settings and subcategories.</p>
        </div>
      </div>

      {/* Category Name */}
      <div className="border border-border rounded-lg bg-card p-4 space-y-2">
        <label className="text-sm font-medium text-foreground">Name</label>
        {isEditingName ? (
          <div className="flex gap-2">
            <input
              className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateName();
                } else if (e.key === "Escape") {
                  setEditedName(category.name);
                  setIsEditingName(false);
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={updateName}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditedName(category.name);
                setIsEditingName(false);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">{category.name}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingName(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* Category Color */}
      <div className="border border-border rounded-lg bg-card p-4 space-y-3">
        <label className="text-sm font-medium text-foreground">Color</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updateColor(color)}
              className={`w-10 h-10 rounded-md border-2 transition-all ${
                category.color === color
                  ? "border-foreground ring-2 ring-offset-2 ring-offset-background ring-ring"
                  : "border-border hover:border-foreground/50"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
          >
            {showCustomColorPicker ? "Hide" : "Custom Color"}
          </Button>
          {showCustomColorPicker && (
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-9 w-20 rounded border border-input cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 h-9 px-3 py-1 text-sm border border-input rounded bg-transparent font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="#000000"
              />
              <Button size="sm" onClick={() => updateColor(customColor)}>
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Subcategories - only show for root categories (one level deep limit) */}
      {category.parentId === null && (
        <div className="border border-border rounded-lg bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Subcategories</label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingSubcategory(!isAddingSubcategory)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Subcategory
            </Button>
          </div>

        {isAddingSubcategory && (
          <div className="flex gap-2 p-3 bg-muted/50 rounded-md">
            <input
              className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Subcategory name..."
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createSubcategory();
                } else if (e.key === "Escape") {
                  setIsAddingSubcategory(false);
                  setNewSubcategoryName("");
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={createSubcategory}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAddingSubcategory(false);
                setNewSubcategoryName("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {children.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No subcategories yet. Add one to organize your timers.
          </p>
        ) : (
          <div className="space-y-2">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: child.color }}
                  />
                  <span className="text-sm text-foreground">{child.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteSubcategory(child.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        </div>
      )}
    </div>
  );
}
