import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, ArrowRight, Clock } from "lucide-react";

interface UsernameGateProps {
  onSubmit: (username: string) => void;
}

export function UsernameGate({ onSubmit }: UsernameGateProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmed = username.trim();
      if (!trimmed) {
        setError("Please enter a username");
        return;
      }

      if (trimmed.length < 2) {
        setError("Username must be at least 2 characters");
        return;
      }

      if (trimmed.length > 32) {
        setError("Username must be 32 characters or less");
        return;
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        setError("Username can only contain letters, numbers, dashes, and underscores");
        return;
      }

      setIsSubmitting(true);
      // Small delay for visual feedback
      setTimeout(() => {
        onSubmit(trimmed);
      }, 150);
    },
    [username, onSubmit]
  );

  // Focus the input on mount
  const inputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="panel p-8 backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clock className="w-8 h-8 text-zinc-900" strokeWidth={2.5} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              Welcome to Time Tracker
            </h1>
            <p className="text-muted-foreground text-sm">
              Choose a username to get started. This will be used to sync your data.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <input
                  ref={inputRef}
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={isSubmitting}
                  className="w-full h-12 pl-11 pr-4 text-base rounded-lg border border-border/50 bg-background/50 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
              {error && (
                <p className="text-destructive text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !username.trim()}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 disabled:opacity-50 disabled:shadow-none"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                  Starting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-muted-foreground/60">
            Your username creates a unique space for your time entries.
            <br />
            Use the same username on other devices to sync.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Shows the current username with an option to change it
 */
export function UsernameDisplay({
  username,
  onClear,
}: {
  username: string;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      title="Click to sign out and change username"
    >
      <User className="w-4 h-4" />
      <span>{username}</span>
    </button>
  );
}

