import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import { LiveStoreProvider } from "@livestore/react";
import { FPSMeter } from "@overengineering/fps-meter";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";

import { VersionBadge } from "../components/VersionBadge.tsx";
import { SyncPayload, schema } from "../livestore/schema.ts";
import LiveStoreWorker from "../livestore.worker.ts?worker";
import { getStoreId } from "../util/store-id.ts";
import { Layout } from "../components/Layout.tsx";

const storeId = getStoreId();

const adapter = makePersistedAdapter({
  storage: { type: "opfs" },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
});

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      renderLoading={(_) => <div>Loading LiveStore ({_.stage})...</div>}
      batchUpdates={batchUpdates}
      storeId={storeId}
      syncPayloadSchema={SyncPayload}
      syncPayload={{ authToken: "insecure-token-change-me" }}
    >
      <div className="fixed top-0 right-0 bg-neutral-800">
        <FPSMeter height={40} />
      </div>
      <Layout>
        <Layout.Sidebar>
          <Layout.Sidebar.Section>
            <Layout.Sidebar.Item>Hey</Layout.Sidebar.Item>
          </Layout.Sidebar.Section>
        </Layout.Sidebar>

        <Layout.Main>
          <Outlet />
        </Layout.Main>
      </Layout>
      <VersionBadge />
      <TanStackRouterDevtools />
    </LiveStoreProvider>
  );
}
