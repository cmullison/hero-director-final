import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

// Import all routes data
import { data } from "./app-sidebar";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const flattenRoutes = (items: any[]) => {
  return items.map((item) => {
    const group = {
      groupTitle: item.title,
      groupIcon: item.icon,
      items: [
        {
          title: item.title,
          url: item.url,
          icon: item.icon,
        },
      ],
    };

    if (item.items) {
      group.items.push(
        ...item.items.map((subItem: any) => ({
          title: subItem.title,
          url: subItem.url,
          icon: item.icon,
        }))
      );
    }

    return group;
  });
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  // Flatten our navigation data
  const routeGroups = React.useMemo(() => flattenRoutes(data.navMain), []);

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Search all routes and commands..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {routeGroups.map((group) => (
            <CommandGroup key={group.groupTitle} heading={group.groupTitle}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.url}
                  onSelect={() => {
                    navigate(item.url);
                    setOpen(false);
                  }}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
