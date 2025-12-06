import * as React from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// Context for sidebar state
interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

function Root({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex isolate relative w-full min-h-svh bg-background text-foreground">
      {children}
    </div>
  );
}

// Sidebar Components
function SidebarRoot({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div
        className={`flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "w-[60px]" : "w-64"
        } border-r border-sidebar-border bg-sidebar text-sidebar-foreground`}
      >
        <nav className="flex h-full min-h-0 flex-col">{children}</nav>
      </div>
    </SidebarContext.Provider>
  );
}

function SidebarHeader({ children }: { children: React.ReactNode }) {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <div className={`flex items-center ${collapsed ? "justify-center p-2" : "justify-between p-4"} pb-2`}>
      {!collapsed && <div className="flex-1 min-w-0">{children}</div>}
      <Button
        variant="ghost"
        size="icon"
        className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </Button>
    </div>
  );
}

function SidebarBody({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className={`flex flex-1 flex-col gap-1 overflow-y-auto ${collapsed ? "p-2" : "p-4"} pt-2`}>
      {children}
    </div>
  );
}

function SidebarFooter({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className={`flex flex-col border-t border-sidebar-border ${collapsed ? "p-2" : "p-4"}`}>
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
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <span className="px-2 mb-1 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
      {children}
    </span>
  );
}

function SidebarSpacer() {
  return <div className="flex-1" />;
}

function SidebarDivider() {
  return (
    <hr className="my-4 border-t border-sidebar-border lg:-mx-4" />
  );
}

// Base anchor component for createLink
interface SidebarLinkBaseProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: React.ReactNode;
  active?: boolean;
  title?: string;
}

const SidebarLinkBase = React.forwardRef<
  HTMLAnchorElement,
  SidebarLinkBaseProps
>(({ children, icon, active = false, className, title, ...props }, ref) => {
  const { collapsed } = useSidebar();
  
  const baseClasses =
    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium transition-colors relative group";
  const activeClasses = active
    ? "bg-sidebar-accent text-sidebar-accent-foreground"
    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground";
    
  const collapsedClasses = collapsed ? "justify-center px-2" : "";

  return (
    <a
      ref={ref}
      className={`${baseClasses} ${activeClasses} ${collapsedClasses} ${className ?? ""}`}
      title={collapsed ? (typeof children === 'string' ? children : title) : undefined}
      {...props}
    >
      {icon && (
        <span className={`flex-shrink-0 w-5 h-5 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"}`}>
          {icon}
        </span>
      )}
      {!collapsed && <span className="truncate">{children}</span>}
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sidebar-primary rounded-r-full" />
      )}
    </a>
  );
});
SidebarLinkBase.displayName = "SidebarLinkBase";

// Create router-aware link using createLink
const CreatedSidebarLink = createLink(SidebarLinkBase);

// Export the final SidebarItem component with preload behavior
const SidebarItem: LinkComponent<typeof SidebarLinkBase> = (props) => {
  return <CreatedSidebarLink preload="intent" {...props} />;
};

// Button variant for non-link sidebar items
interface SidebarButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function SidebarButton({
  children,
  icon,
  active = false,
  onClick,
}: SidebarButtonProps) {
  const { collapsed } = useSidebar();
  const baseClasses =
    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium transition-colors relative group";
  const activeClasses = active
    ? "bg-sidebar-accent text-sidebar-accent-foreground"
    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground";
  const collapsedClasses = collapsed ? "justify-center px-2" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} ${collapsedClasses}`}
      title={collapsed ? (typeof children === 'string' ? children : undefined) : undefined}
    >
      {icon && (
        <span className={`flex-shrink-0 w-5 h-5 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"}`}>
          {icon}
        </span>
      )}
      {!collapsed && <span className="truncate">{children}</span>}
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sidebar-primary rounded-r-full" />
      )}
    </button>
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
  const { collapsed } = useSidebar();
  
  if (collapsed) return null;
  
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-sidebar-accent/50 transition-colors w-full"
    >
      {icon && (
        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {icon}
        </span>
      )}
      <span className="font-semibold text-sm text-sidebar-foreground">{children}</span>
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
  const { collapsed } = useSidebar();

  return (
    <button
      type="button"
      className={`flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent/50 transition-colors w-full ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? name : undefined}
    >
      <div className="w-8 h-8 rounded-full bg-sidebar-accent overflow-hidden flex-shrink-0 border border-sidebar-border">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sidebar-foreground/70 font-medium text-xs">
            {name.charAt(0)}
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium truncate text-sidebar-foreground">{name}</div>
          <div className="text-xs text-sidebar-foreground/50 truncate">
            {email}
          </div>
        </div>
      )}
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
  Button: SidebarButton,
  Spacer: SidebarSpacer,
  Divider: SidebarDivider,
  HeaderButton: SidebarHeaderButton,
  UserProfile: SidebarUserProfile,
});

// Main content area
function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col bg-background">
      {children}
    </div>
  );
}

function MainHeader({ children }: { children: React.ReactNode }) {
  return (
    <header className="px-6 py-4 border-b border-border flex items-center gap-4 h-16">
      {children}
    </header>
  );
}

function MainTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-lg font-semibold text-foreground">{children}</h1>;
}

function MainBody({ children }: { children: React.ReactNode }) {
  return <div className="p-6 overflow-auto grow bg-muted/30">{children}</div>;
}

const MainArea = Object.assign(Main, {
  Header: MainHeader,
  Title: MainTitle,
  Body: MainBody,
  Container: ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-5xl mx-auto w-full space-y-6">{children}</div>
  )
});

export const Layout = Object.assign(Root, {
  Sidebar: Sidebar,
  Main: MainArea,
});
