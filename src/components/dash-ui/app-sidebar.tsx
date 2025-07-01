"use client";

import * as React from "react";
import { useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Bot,
  Brain,
  Calendar,
  ChartLine,
  Settings2,
  Video,
  LayoutDashboard,
  FileText,
  Image,
  Wrench,
  HardDriveIcon,
  MessageSquare,
  Mic,
  Speaker,
} from "lucide-react";

import { NavUser } from "@/components/dash-ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavSecondary } from "./nav-secondary";
import { TeamSwitcher } from "./team-switcher";
import { AgentIcon } from "../agent-icon";
import { Robot } from "@phosphor-icons/react";
import { NavSandbox } from "./nav-sandbox";

// This is sample data from main branch
export const data = {
  teams: [
    {
      name: "Hub",
      logo: Robot,
      plan: "",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [],
    },
    /* {
      title: "AI Sandbox",
      url: "#",
      icon: Wrench,
      items: [
        {
          title: "Flux-Schnell",
          url: "/dashboard/sandbox/flux-schnell",
        },
        {
          title: "GPT-Image",
          url: "/dashboard/sandbox/gpt-image",
        },
        {
          title: "Video Generation",
          url: "/dashboard/sandbox/video-generation",
        },
      ],
    }, */
    {
      title: "My Files",
      url: "/dashboard/r2-storage",
      icon: HardDriveIcon,
      items: [],
    },
    {
      title: "My Content",
      url: "/dashboard/content-creation",
      icon: BookOpen,
      items: [],
    },
    {
      title: "My Prompts",
      url: "/dashboard/prompts",
      icon: FileText,
      items: [],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
    },
  ],
  projects: [
    {
      name: "Coordier",
      url: "/dashboard/issues",
      icon: Calendar,
    },
  ],
  sandbox: [
    {
      name: "Image Generation",
      url: "/dashboard/sandbox/image-generation",
      icon: Image,
    },
    {
      name: "Video Generation",
      url: "/dashboard/sandbox/video-generation",
      icon: Video,
    },
    {
      name: "Voice Generation",
      url: "/dashboard/sandbox/voice-generation",
      icon: Mic,
    },
    {
      name: "Sound Generation",
      url: "/dashboard/sandbox/sound-generation",
      icon: Speaker,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const [activeItem, setActiveItem] = React.useState(() => {
    return (
      data.navMain.find(
        (item) =>
          item.url === location.pathname ||
          (item.url !== "/dashboard" &&
            location.pathname.startsWith(item.url)) ||
          // @ts-ignore
          item.items?.some((subItem) => location.pathname === subItem.url)
      ) || data.navMain[0]
    );
  });

  // Update active item when route changes
  React.useEffect(() => {
    const newActiveItem = data.navMain.find(
      (item) =>
        item.url === location.pathname ||
        (item.url !== "/dashboard" && location.pathname.startsWith(item.url)) ||
        // @ts-ignore
        item.items?.some((subItem) => location.pathname === subItem.url)
    );
    if (newActiveItem && newActiveItem !== activeItem) {
      setActiveItem(newActiveItem);
    }
  }, [location.pathname]);

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <TeamSwitcher />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSandbox sandbox={data.sandbox} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
