"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Users, Building } from "lucide-react";
import { useTeam } from "@/providers/TeamProvider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Fallback icon component for teams without custom images
const TeamIcon = ({ name }: { name: string }) => {
  // Use first letter of team name as fallback
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex size-4 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-semibold">
      {initial}
    </div>
  );
};

export function TeamSwitcher() {
  const { isMobile, state } = useSidebar();
  const {
    currentTeam,
    allTeams,
    teamsLoading,
    handleTeamSwitch,
    showCreateTeam,
    setShowCreateTeam,
  } = useTeam();

  const isCollapsed = state === "collapsed";

  // Show loading state
  if (teamsLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            disabled
            tooltip={isCollapsed ? "Loading..." : undefined}
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building className="size-4 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Loading...</span>
                <span className="truncate text-xs">Please wait</span>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Show create team prompt if no teams exist
  if (!currentTeam && allTeams.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => setShowCreateTeam(true)}
            className="cursor-pointer hover:bg-sidebar-accent"
            tooltip={isCollapsed ? "Create Team" : undefined}
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Plus className="size-4" />
            </div>
            {!isCollapsed && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Create Team</span>
                <span className="truncate text-xs">Get started</span>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!currentTeam) {
    return null;
  }

  const tooltipContent = isCollapsed
    ? `${currentTeam.name} (${
        currentTeam.user_role === "owner"
          ? "Owner"
          : currentTeam.user_role === "admin"
            ? "Admin"
            : "Member"
      })`
    : undefined;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={tooltipContent}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {currentTeam.image_url ? (
                  <img
                    src={currentTeam.image_url}
                    alt={currentTeam.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <TeamIcon name={currentTeam.name} />
                )}
              </div>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {currentTeam.name}
                    </span>
                    <span className="truncate text-xs">
                      {currentTeam.user_role === "owner"
                        ? "Owner"
                        : currentTeam.user_role === "admin"
                          ? "Admin"
                          : "Member"}
                      {currentTeam.member_count &&
                        ` • ${currentTeam.member_count} member${currentTeam.member_count !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {allTeams.map((team, index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleTeamSwitch(team)}
                className="gap-2 p-2"
              >
                <div className="size-6 rounded-lg overflow-hidden">
                  {team.image_url ? (
                    <img
                      src={team.image_url}
                      alt={team.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {team.user_role === "owner"
                      ? "Owner"
                      : team.user_role === "admin"
                        ? "Admin"
                        : "Member"}
                  </span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setShowCreateTeam(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-lg border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
