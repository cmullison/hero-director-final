import { AppSidebar } from "@/components/dash-ui/app-sidebar";
import { useNavigate, Outlet } from "react-router-dom";
import { useSession, logout } from "../../lib/auth-client";
import { PanelLeftIcon, Menu, Plus, FolderDotIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { CommandPalette } from "@/components/dash-ui/command-palette";
import { DynamicBreadcrumbs } from "@/components/ui/dynamic-breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CodeSidebar } from "@/components/code-sidebar";
import CodeCrumbs from "./code-crumbs";
import { ProjectProvider } from "@/providers/ProjectProvider";
import { TeamProvider, useTeam } from "@/providers/TeamProvider";
import { GitHubProvider } from "@/providers/GitHubProvider";
import CreateProjectDialog from "@/components/project/CreateProjectDialog";
import CreateTeamDialog from "@/components/dash-ui/CreateTeamDialog";
import "../../index.css";

function DashboardContent() {
  const { showCreateTeam, setShowCreateTeam } = useTeam();

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center border-b px-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <IconSidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumbs />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CodeCrumbs />
            </div>
          </header>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
            <CodeSidebar />
          </div>
        </SidebarInset>
        <CommandPalette />
      </SidebarProvider>
      <CreateProjectDialog />
      <CreateTeamDialog
        isOpen={showCreateTeam}
        onOpenChange={setShowCreateTeam}
      />
    </>
  );
}

export default function Dashboard() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  async function handleLogout() {
    const result = await logout();
    if (result.success) {
      navigate("/login");
    }
  }

  // If loading, show spinner (or null/placeholder)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // PrivateRoute handles the redirect, so if we reach here and still have no user,
  // it's an unexpected state, but we shouldn't render the auth error/login button.
  // We could show a generic error or just nothing.
  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Error: User data not available after authentication check.
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <TeamProvider>
        <ProjectProvider>
          <GitHubProvider>
            <DashboardContent />
          </GitHubProvider>
        </ProjectProvider>
      </TeamProvider>
    </div>
  );
}

function IconSidebarTrigger() {
  const { open, setOpen, isMobile, openMobile, setOpenMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="-ml-1"
      >
        <PanelLeftIcon className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    </>
  );
}
