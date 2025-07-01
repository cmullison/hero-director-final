"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Collaborator = {
  id: string;
  name: string;
  email: string;
  status: "online" | "offline" | "away";
  avatar: string | null;
  role: "owner" | "editor" | "viewer";
};

interface CollaborationPanelProps {
  collaborators?: Collaborator[];
}

export function CollaborationPanel({
  collaborators = [],
}: CollaborationPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Collaborators</h3>
        <p className="text-xs text-muted-foreground">
          People working on this project
        </p>
      </div>
      <div className="space-y-2">
        {collaborators.length > 0 ? (
          collaborators.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback>
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`hidden absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                    user.status === "online"
                      ? "bg-green-500"
                      : user.status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                  }`}
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-medium">{user.name}</p>
                  <Badge variant="outline" className="ml-2 text-[10px]">
                    {user.role}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              No collaborators yet
            </p>
          </div>
        )}
      </div>
      <div className="pt-2">
        <h3 className="text-sm font-medium">Invite People</h3>
        <div className="mt-2 space-y-3">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">Role</Label>
            <Select defaultValue="editor">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="w-full">
            Send Invite
          </Button>
        </div>
      </div>
    </div>
  );
}
