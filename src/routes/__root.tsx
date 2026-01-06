import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import { LiveStoreProvider } from "@livestore/react";
import { FPSMeter } from "@overengineering/fps-meter";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import {
  Clock,
  Home,
  LayoutGrid,
  PieChart,
  Search,
  Settings,
  Sparkles,
  HelpCircle,
  LogOut,
} from "lucide-react";

import { VersionBadge } from "../components/VersionBadge.tsx";
import { SyncPayload, schema } from "../livestore/schema.ts";
import LiveStoreWorker from "../livestore.worker.ts?worker";
import { Layout } from "../components/Layout.tsx";
import { FloatingTimer } from "@/components/FloatingTimer";
import { UsernameGate } from "@/components/UsernameGate";
import { useUsername, deriveStoreId } from "@/util/username";
import { useMemo } from "react";

export const Route = createRootRoute({
  component: RootComponent,
});

const NAV_ITEMS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Timers", to: "/timers", icon: Clock },
  { label: "Categories", to: "/categories", icon: LayoutGrid },
  { label: "Reports", to: "/reports", icon: PieChart },
  { label: "Settings", to: "/settings", icon: Settings },
];

function RootComponent() {
  const { username, setUsername, clearUsername, hasUsername, storeId } =
    useUsername();

  // Show username gate if no username is set
  if (!hasUsername || !username || !storeId) {
    return <UsernameGate onSubmit={setUsername} />;
  }

  return (
    <AuthenticatedApp
      username={username}
      storeId={storeId}
      onLogout={clearUsername}
    />
  );
}

// Create adapter outside component to avoid recreation
const adapter = makePersistedAdapter({
  storage: { type: "opfs" },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
});

function AuthenticatedApp({
  username,
  storeId,
  onLogout,
}: {
  username: string;
  storeId: string;
  onLogout: () => void;
}) {
  // Memoize syncPayload - auth token from environment variable
  const syncPayload = useMemo(
    () => ({
      authToken: import.meta.env.VITE_AUTH_TOKEN || "insecure-token-change-me",
    }),
    []
  );

  return (
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      renderLoading={(_) => (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
              <Clock className="w-6 h-6 text-zinc-900" />
            </div>
            <p className="text-muted-foreground">
              Loading LiveStore ({_.stage})...
            </p>
          </div>
        </div>
      )}
      batchUpdates={batchUpdates}
      storeId={storeId}
      syncPayloadSchema={SyncPayload}
      syncPayload={syncPayload}
    >
      <div className="fixed top-0 right-0 bg-neutral-800 z-50">
        <FPSMeter height={40} />
      </div>
      <Layout>
        <Layout.Sidebar>
          <Layout.Sidebar.Header>
            <Layout.Sidebar.HeaderButton icon="T">
              Time Tracker
            </Layout.Sidebar.HeaderButton>
          </Layout.Sidebar.Header>

          <Layout.Sidebar.Body>
            <Layout.Sidebar.Section>
              <Layout.Sidebar.Button icon={<Search className="w-5 h-5" />}>
                Search
              </Layout.Sidebar.Button>
            </Layout.Sidebar.Section>

            <Layout.Sidebar.Divider />

            <Layout.Sidebar.Section>
              {NAV_ITEMS.map((item) => (
                <Layout.Sidebar.Item
                  key={item.label}
                  to={item.to}
                  icon={<item.icon className="w-5 h-5" />}
                  activeProps={{ active: true }}
                >
                  {item.label}
                </Layout.Sidebar.Item>
              ))}
            </Layout.Sidebar.Section>

            <Layout.Sidebar.Divider />

            <Layout.Sidebar.Section>
              <Layout.Sidebar.Label>Recent Projects</Layout.Sidebar.Label>
              <Layout.Sidebar.Button>Design System</Layout.Sidebar.Button>
              <Layout.Sidebar.Button>Marketing Site</Layout.Sidebar.Button>
              <Layout.Sidebar.Button>Mobile App</Layout.Sidebar.Button>
              <Layout.Sidebar.Button>API Development</Layout.Sidebar.Button>
            </Layout.Sidebar.Section>

            <Layout.Sidebar.Spacer />
          </Layout.Sidebar.Body>

          <Layout.Sidebar.Footer>
            <Layout.Sidebar.Section>
              <Layout.Sidebar.Button icon={<HelpCircle className="w-5 h-5" />}>
                Support
              </Layout.Sidebar.Button>
              <Layout.Sidebar.Button icon={<Sparkles className="w-5 h-5" />}>
                Changelog
              </Layout.Sidebar.Button>
              <Layout.Sidebar.Button
                icon={<LogOut className="w-5 h-5" />}
                onClick={onLogout}
              >
                Sign Out
              </Layout.Sidebar.Button>
            </Layout.Sidebar.Section>
            <div className="mt-4">
              <Layout.Sidebar.UserProfile
                name={username}
                email={`${username}@local`}
              />
            </div>
          </Layout.Sidebar.Footer>
        </Layout.Sidebar>

        <Layout.Main>
          <Layout.Main.Body>
            <Outlet />
            <div className="fixed bottom-8 right-8 z-50">
              <FloatingTimer />
            </div>
          </Layout.Main.Body>
        </Layout.Main>
      </Layout>
      <VersionBadge />
      <TanStackRouterDevtools />
    </LiveStoreProvider>
  );
}
