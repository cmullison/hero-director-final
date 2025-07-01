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
  Code,
  Server,
  Settings2,
  Video,
  LayoutDashboard,
  FileText,
  Image,
  Wrench,
  HardDriveIcon,
  ChartBar,
  Github,
  MessageSquare,
  GitPullRequest,
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
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: MessageSquare,
      items: [],
    },
    {
      title: "Agents",
      url: "/dashboard/agents",
      icon: AgentIcon,
      items: [
        /*         {
          title: "Claude",
          url: "#",
        },
        {
          title: "OpenAI",
          url: "#",
        }, */
        {
          title: "Conversations",
          url: "/dashboard/agents/conversations",
        },
      ],
    },
    {
      title: "Code Assistant",
      url: "/dashboard/editor",
      icon: Code,
      items: [],
    },
    {
      title: "AI Sandbox",
      url: "#",
      icon: Wrench,
      items: [
        /*         {
          title: "Chat",
          url: "#",
        }, */
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
        /*         {
          title: "Multi-modal",
          url: "#",
        }, */
      ],
    },
    {
      title: "MCP Client (beta)",
      url: "/dashboard/mcp-client",
      icon: Server,
      items: [],
    },
    {
      title: "GitHub Integration",
      url: "/dashboard/github",
      icon: Github,
      items: [],
    },
    {
      title: "Issues",
      url: "/dashboard/issues",
      icon: GitPullRequest,
      items: [],
    },
    {
      title: "Anthropic",
      url: "/dashboard/anthropic",
      icon: Brain,
      items: [],
    },
    {
      title: "R2 Storage",
      url: "/dashboard/r2-storage",
      icon: HardDriveIcon,
      items: [],
    },
    {
      title: "Lit",
      url: "/dashboard/analytics",
      icon: ChartBar,
      items: [],
    },
    {
      title: "Content Creation",
      url: "/dashboard/content-creation",
      icon: BookOpen,
      items: [],
    },
    {
      title: "Models & Providers",
      url: "/dashboard/models",
      icon: Bot,
      items: [
        /*         {
          title: "OpenAI",
          url: "#",
        },
        {
          title: "Claude",
          url: "#",
        },
        {
          title: "Google",
          url: "#",
        },
        {
          title: "Replicate",
          url: "#",
        },
        {
          title: "AI Gateway",
          url: "#",
        },
        {
          title: "Performance",
          url: "#",
        }, */
      ],
    },
    /*     {
      title: "Prompts",
      url: "#",
      icon: FileText,
      items: [],
    }, */
    {
      title: "Prompts",
      url: "/dashboard/prompts",
      icon: FileText,
      items: [],
    },
    {
      title: "Assets",
      url: "#",
      icon: Image,
      items: [
        /*         {
          title: "Images",
          url: "#",
        },
        {
          title: "Videos",
          url: "#",
        },
        {
          title: "Documents",
          url: "#",
        },
        {
          title: "Library",
          url: "#",
        }, */
        {
          title: "Templates",
          url: "/dashboard/content-creation",
        },
      ],
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
      url: "/dashboard/project",
      icon: Calendar,
    },
    {
      name: "Morning Reports",
      url: "/dashboard/project",
      icon: ChartLine,
    },
    {
      name: "Hero Director",
      url: "/dashboard/project",
      icon: Video,
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
        <NavProjects projects={data.projects} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
