function Root({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex isolate relative w-full min-h-svh bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-50">
      {children}
    </div>
  );
}

function SidebarRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-64">
      <nav className="flex h-full min-h-0 flex-col">{children}</nav>
    </div>
  );
}
function SidebarSection({ children }: { children: React.ReactNode }) {
  return <div className="p-4 flex flex-col">{children}</div>;
}

function SidebarItem({ children }: { children: React.ReactNode }) {
  return <span className="relative">{children}</span>;
}

const Sidebar = Object.assign(SidebarRoot, {
  Section: SidebarSection,
  Item: SidebarItem,
});

function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col py-2 pr-2">
      <div className="grow p-6 rounded-lg shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        {children}
      </div>
    </div>
  );
}

export const Layout = Object.assign(Root, {
  Sidebar: Sidebar,
  Main: Main,
});
