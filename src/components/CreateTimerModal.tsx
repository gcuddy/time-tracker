import * as React from "react";
import {
  Dialog,
  Modal,
  ModalOverlay,
  Label,
  Input,
  Button as AriaButton,
  Heading,
} from "react-aria-components";
import { cn } from "@/lib/utils";

interface CreateTimerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreateTimer: (name: string, color: string) => void;
  initialName?: string;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];

export function CreateTimerModal({
  isOpen,
  onOpenChange,
  onCreateTimer,
  initialName = "",
}: CreateTimerModalProps) {
  const [name, setName] = React.useState(initialName);
  const [selectedColor, setSelectedColor] = React.useState(PRESET_COLORS[5]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update name when initialName changes (when opening from palette)
  React.useEffect(() => {
    setName(initialName);
  }, [initialName]);

  // Focus input when opening
  React.useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Reset form when closing
  React.useEffect(() => {
    if (!isOpen) {
      // Don't reset immediately so animation can complete
      const timeout = setTimeout(() => {
        setName("");
        setSelectedColor(PRESET_COLORS[5]);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateTimer(name.trim(), selectedColor);
      onOpenChange(false);
    }
  };

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
          "w-full max-w-md rounded-xl overflow-hidden",
          "bg-zinc-900 border border-zinc-700/50",
          "shadow-2xl shadow-black/50",
          "data-[entering]:animate-in data-[entering]:zoom-in-95 data-[entering]:slide-in-from-bottom-2 data-[entering]:duration-200",
          "data-[exiting]:animate-out data-[exiting]:zoom-out-95 data-[exiting]:slide-out-to-bottom-2 data-[exiting]:duration-150"
        )}
      >
        <Dialog className="outline-none p-5" aria-label="Create new timer">
          <Heading
            slot="title"
            className="text-lg font-semibold text-zinc-100 mb-5"
          >
            Create New Timer
          </Heading>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            <div className="space-y-5">
              {/* Name field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-400">
                  Timer Name
                </Label>
                <Input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deep Work, Meetings, Breaks..."
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg",
                    "bg-zinc-800/80 border border-zinc-600/50",
                    "text-zinc-100 placeholder:text-zinc-500",
                    "text-base font-medium tracking-tight",
                    "focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                  )}
                />
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-400">
                  Color
                </Label>
                <div className="grid grid-cols-8 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all duration-150",
                        "ring-2 ring-offset-2 ring-offset-zinc-900",
                        selectedColor === color
                          ? "ring-white scale-110"
                          : "ring-transparent hover:ring-zinc-500 hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30">
                <span
                  className="w-5 h-5 rounded-full shrink-0 ring-1 ring-white/20"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-zinc-200 font-medium">
                  {name || "Timer preview"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <AriaButton
                type="button"
                onPress={() => onOpenChange(false)}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-lg font-medium",
                  "bg-zinc-800 text-zinc-300 border border-zinc-700",
                  "hover:bg-zinc-700 hover:text-zinc-100",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                  "transition-colors"
                )}
              >
                Cancel
              </AriaButton>
              <AriaButton
                type="submit"
                isDisabled={!name.trim()}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-lg font-medium",
                  "bg-amber-500 text-zinc-900",
                  "hover:bg-amber-400",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                Create & Start
              </AriaButton>
            </div>
          </form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

