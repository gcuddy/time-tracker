import { Link } from "@tanstack/react-router";

function Root({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex isolate relative w-full min-h-svh bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-50">
      {children}
    </div>
  );
}

// Sidebar Components
function SidebarRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-64 flex flex-col">
      <nav className="flex h-full min-h-0 flex-col">{children}</nav>
    </div>
  );
}

function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 pb-2">{children}</div>;
}

function SidebarBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 pt-2">
      {children}
    </div>
  );
}

function SidebarFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col border-t border-zinc-950/5 p-4 dark:border-white/5">
      {children}
    </div>
  );
}

function SidebarSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col gap-0.5 ${className}`}>{children}</div>;
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
      {children}
    </span>
  );
}

function SidebarSpacer() {
  return <div className="flex-1" />;
}

function SidebarDivider() {
  return (
    <hr className="my-4 border-t border-zinc-950/5 dark:border-white/5 lg:-mx-4" />
  );
}

interface SidebarItemProps {
  children: React.ReactNode;
  href?: string;
  active?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

function SidebarItem({
  children,
  href,
  active = false,
  icon,
  onClick,
}: SidebarItemProps) {
  const baseClasses =
    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium transition-colors";
  const activeClasses = active
    ? "bg-zinc-950/5 dark:bg-white/5 text-zinc-950 dark:text-white"
    : "text-zinc-600 hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white";

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
      {active && (
        <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-zinc-950 dark:bg-white rounded-r" />
      )}
    </>
  );

  if (href) {
    return (
      <span className="relative">
        <Link to={href} className={`${baseClasses} ${activeClasses}`}>
          {content}
        </Link>
      </span>
    );
  }

  return (
    <span className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${activeClasses}`}
      >
        {content}
      </button>
    </span>
  );
}

// Header button with dropdown indicator
function SidebarHeaderButton({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors"
    >
      {icon && (
        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
          {icon}
        </span>
      )}
      <span className="font-semibold text-sm">{children}</span>
      <svg
        className="w-4 h-4 text-zinc-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
    </button>
  );
}

// User profile component for footer
function SidebarUserProfile({
  name,
  email,
  avatar,
}: {
  name: string;
  email: string;
  avatar?: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-lg p-2 hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors w-full"
    >
      <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-medium">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          {email}
        </div>
      </div>
      <svg
        className="w-4 h-4 text-zinc-400 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 15.75l7.5-7.5 7.5 7.5"
        />
      </svg>
    </button>
  );
}

const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Body: SidebarBody,
  Footer: SidebarFooter,
  Section: SidebarSection,
  Label: SidebarLabel,
  Item: SidebarItem,
  Spacer: SidebarSpacer,
  Divider: SidebarDivider,
  HeaderButton: SidebarHeaderButton,
  UserProfile: SidebarUserProfile,
});

// Main content area
function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col py-2 pr-2">
      <div className="grow rounded-lg shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function MainHeader({ children }: { children: React.ReactNode }) {
  return (
    <header className="px-6 py-6 border-b border-zinc-950/5 dark:border-white/10">
      {children}
    </header>
  );
}

function MainTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-xl font-semibold">{children}</h1>;
}

function MainBody({ children }: { children: React.ReactNode }) {
  return <div className="p-6 overflow-auto flex-1">{children}</div>;
}

const MainArea = Object.assign(Main, {
  Header: MainHeader,
  Title: MainTitle,
  Body: MainBody,
});

export const Layout = Object.assign(Root, {
  Sidebar: Sidebar,
  Main: MainArea,
});
