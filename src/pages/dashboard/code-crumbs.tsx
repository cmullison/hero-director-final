import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Code,
  ChevronsUpDown,
  FileCode,
  GitBranch,
  Plus,
  Save,
  Share2,
  Play,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { useProject } from "@/providers/ProjectProvider";

interface CodeCrumbsProps {
  showProjectOnly?: boolean;
  showActionsOnly?: boolean;
}

export default function CodeCrumbs({
  showProjectOnly = false,
  showActionsOnly = false,
}: CodeCrumbsProps) {
  const { user } = useSession();
  const {
    currentProject,
    allProjects,
    projectLoading,
    handleProjectSwitch,
    selectedFile,
    setShowCreateProject,
  } = useProject();

  const handleMainSave = () => {
    // Check if this is an "Untitled Project" that needs to be renamed
    if (currentProject?.name === "Untitled Project") {
      console.log("[DEBUG] Untitled Project detected - prompting for rename");
      setShowCreateProject(true);
    } else if (!currentProject?.id) {
      console.log("[DEBUG] No current project - showing create project dialog");
      setShowCreateProject(true);
    } else {
      // TODO: Save the current file if it has unsaved changes
      console.log(
        "[DEBUG] Save current file functionality needs to be implemented"
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };
  const isEditorRoute = useLocation().pathname.includes("/editor");
  // Don't render if not on editor route
  if (!isEditorRoute) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 ml-4">
      {/* Left side - Project and file info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 font-semibold text-primary hover:bg-transparent"
              >
                <span>
                  {projectLoading
                    ? "Loading..."
                    : currentProject?.name || "Untitled Project"}
                </span>
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" sideOffset={4}>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Projects
              </DropdownMenuLabel>
              {allProjects.length > 0 ? (
                allProjects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => handleProjectSwitch(project)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <FileCode className="size-4 shrink-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{project.name}</span>
                      {project.description && (
                        <span className="text-xs text-muted-foreground">
                          {project.description}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <FileCode className="size-4 shrink-0" />
                  </div>
                  <span className="text-muted-foreground">No projects</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setShowCreateProject(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add project
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <FileCode className="h-4 w-4" />
            <span>{selectedFile?.name || "No file selected"}</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <GitBranch className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right side - Action buttons and avatar */}
      <div className="flex items-center gap-2 ml-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleMainSave}
              >
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {currentProject?.name === "Untitled Project"
                ? "Name your project"
                : currentProject?.id
                  ? "Save current file"
                  : "Create project & associate all files"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Play className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Run</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="ml-2 flex -space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add user</span>
          </Button>
        </div>
        <Avatar className="h-8 w-8 border-2 border-background">
          <AvatarImage
            className="object-cover"
            src={user?.image || ""}
            alt="User"
          />
          <AvatarFallback>
            {user?.name
              ? getInitials(user.name)
              : user?.email?.[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
