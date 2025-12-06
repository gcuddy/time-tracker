import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
  Input,
  ListBox,
  ListBoxItem,
  Text,
} from "react-aria-components";
import { useQuery } from "@livestore/react";
import { categories$ } from "../livestore/queries";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectCategory: (category: Category) => void;
  onCreateNew: (searchText: string) => void;
}

export function CommandPalette({
  isOpen,
  onOpenChange,
  onSelectCategory,
  onCreateNew,
}: CommandPaletteProps) {
  const categories = useQuery(categories$);
  const [searchText, setSearchText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredCategories = React.useMemo(() => {
    if (!searchText.trim()) return categories;
    const lower = searchText.toLowerCase();
    return categories.filter((cat) => cat.name.toLowerCase().includes(lower));
  }, [categories, searchText]);

  const showCreateOption =
    searchText.trim() &&
    !categories.some(
      (cat) => cat.name.toLowerCase() === searchText.toLowerCase()
    );

  // Reset search when closing
  React.useEffect(() => {
    if (!isOpen) {
      setSearchText("");
    }
  }, [isOpen]);

  // Focus input when opening
  React.useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is rendered
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className={cn(
        "fixed inset-0 z-50 flex items-start justify-center pt-[20vh]",
        "bg-black/60 backdrop-blur-sm",
        "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:duration-200",
        "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:duration-150"
      )}
    >
      <Modal
        className={cn(
          "w-full max-w-lg rounded-xl overflow-hidden",
          "bg-zinc-900 border border-zinc-700/50",
          "shadow-2xl shadow-black/50",
          "data-[entering]:animate-in data-[entering]:zoom-in-95 data-[entering]:slide-in-from-bottom-2 data-[entering]:duration-200",
          "data-[exiting]:animate-out data-[exiting]:zoom-out-95 data-[exiting]:slide-out-to-bottom-2 data-[exiting]:duration-150"
        )}
      >
        <Dialog className="outline-none" aria-label="Timer command palette">
          <div className="p-3 border-b border-zinc-700/50">
            <Input
              ref={inputRef}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search timers or type to create..."
              className={cn(
                "w-full px-3 py-2.5 rounded-lg",
                "bg-zinc-800/80 border border-zinc-600/50",
                "text-zinc-100 placeholder:text-zinc-500",
                "text-base font-medium tracking-tight",
                "focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
              )}
            />
          </div>

          <ListBox
            aria-label="Timer categories"
            selectionMode="single"
            className="max-h-80 overflow-y-auto p-2"
            onAction={(key) => {
              if (key === "create-new") {
                onCreateNew(searchText.trim());
              } else {
                const category = categories.find((c) => c.id === key);
                if (category) {
                  onSelectCategory(category);
                }
              }
            }}
          >
            {showCreateOption && (
              <ListBoxItem
                id="create-new"
                textValue={`Create "${searchText}"`}
                className={cn(
                  "px-3 py-2.5 rounded-lg cursor-pointer mb-1",
                  "flex items-center gap-3",
                  "text-amber-400 font-medium",
                  "data-[focused]:bg-amber-500/20 data-[focused]:outline-none",
                  "data-[selected]:bg-amber-500/30"
                )}
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/20 text-amber-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                </span>
                <Text slot="label">Create "{searchText}"</Text>
              </ListBoxItem>
            )}

            {filteredCategories.length === 0 && !showCreateOption ? (
              <div className="px-3 py-8 text-center text-zinc-500">
                {categories.length === 0
                  ? "No timers yet. Type to create one!"
                  : "No matching timers found"}
              </div>
            ) : (
              filteredCategories.map((category) => (
                <ListBoxItem
                  key={category.id}
                  id={category.id}
                  textValue={category.name}
                  className={cn(
                    "px-3 py-2.5 rounded-lg cursor-pointer mb-1",
                    "flex items-center gap-3",
                    "text-zinc-200",
                    "data-[focused]:bg-zinc-700/60 data-[focused]:outline-none",
                    "data-[selected]:bg-zinc-700/80"
                  )}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 ring-1 ring-white/20"
                    style={{ backgroundColor: category.color }}
                  />
                  <Text slot="label" className="font-medium">
                    {category.name}
                  </Text>
                </ListBoxItem>
              ))
            )}
          </ListBox>

          <div className="px-3 py-2 border-t border-zinc-700/50 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex gap-3">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  ↑↓
                </kbd>{" "}
                navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  ↵
                </kbd>{" "}
                select
              </span>
            </div>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                esc
              </kbd>{" "}
              close
            </span>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

