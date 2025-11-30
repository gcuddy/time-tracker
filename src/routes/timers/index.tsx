import { useStore } from "@livestore/react";
import { createFileRoute } from "@tanstack/react-router";
import { visibleCategories$ } from "../../components/MainSection";

export const Route = createFileRoute("/timers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { store } = useStore();

  const visibleCategories = store.useQuery(visibleCategories$);

  return <div></div>;
}
