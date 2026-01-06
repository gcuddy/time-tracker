import { createFileRoute } from "@tanstack/react-router";
import { useUsername } from "@/util/username";
import { Button } from "@/components/ui/button";
import { User, LogOut, Database, Info } from "lucide-react";
import { useStore } from "@livestore/react";
import { eventsWithCategories$, tags$ } from "@/livestore/queries";
import { visibleCategories$ } from "@/components/MainSection";

export const Route = createFileRoute("/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { username, clearUsername } = useUsername();
  const { store } = useStore();
  const events = store.useQuery(eventsWithCategories$);
  const categories = store.useQuery(visibleCategories$);
  const tags = store.useQuery(tags$);

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out? Your local data will remain safe and can be accessed by signing in with the same username.")) {
      clearUsername();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      {/* Account Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Account
        </h3>
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Username</div>
              <div className="text-lg font-semibold mt-1">{username}</div>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Signing out will return you to the login screen. Your data is saved locally and will be available when you sign back in.
            </p>
          </div>
        </div>
      </div>

      {/* Data Statistics Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Statistics
        </h3>
        <div className="p-6 bg-card border border-border rounded-lg">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Categories</div>
              <div className="text-2xl font-bold mt-1">{categories.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Events</div>
              <div className="text-2xl font-bold mt-1">{events.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Tags</div>
              <div className="text-2xl font-bold mt-1">{tags.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Info className="h-5 w-5" />
          About
        </h3>
        <div className="p-6 bg-card border border-border rounded-lg space-y-3">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Application</div>
            <div className="text-base mt-1">Time Tracker</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Storage</div>
            <div className="text-base mt-1">Local-first with LiveStore</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Sync</div>
            <div className="text-base mt-1">Cloudflare Workers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
