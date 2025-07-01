import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTeam } from "@/providers/TeamProvider";

interface CreateTeamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTeamDialog({
  isOpen,
  onOpenChange,
}: CreateTeamDialogProps) {
  const { allTeams, createTeam } = useTeam();

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [newTeamImageUrl, setNewTeamImageUrl] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  // Create new team
  const handleCreateTeam = useCallback(async () => {
    if (!newTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      setCreatingTeam(true);
      await createTeam(
        newTeamName.trim(),
        newTeamDescription.trim() || undefined,
        newTeamImageUrl.trim() || undefined
      );

      // Reset form
      setNewTeamName("");
      setNewTeamDescription("");
      setNewTeamImageUrl("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating team:", error);
      // Error toast is already shown in createTeam function
    } finally {
      setCreatingTeam(false);
    }
  }, [
    newTeamName,
    newTeamDescription,
    newTeamImageUrl,
    createTeam,
    onOpenChange,
  ]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNewTeamName("");
      setNewTeamDescription("");
      setNewTeamImageUrl("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {allTeams.length === 0
              ? "Create Your First Team"
              : "Create New Team"}
          </DialogTitle>
          {allTeams.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Teams help you organize and collaborate on projects with others.
            </p>
          )}
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-team-name" className="text-sm">
              Team Name
            </Label>
            <Input
              id="new-team-name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name"
              disabled={creatingTeam}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-team-description" className="text-sm">
              Description (Optional)
            </Label>
            <Textarea
              id="new-team-description"
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
              placeholder="Enter team description"
              disabled={creatingTeam}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-team-image" className="text-sm">
              Team Image URL (Optional)
            </Label>
            <Input
              id="new-team-image"
              value={newTeamImageUrl}
              onChange={(e) => setNewTeamImageUrl(e.target.value)}
              placeholder="https://example.com/team-logo.png"
              disabled={creatingTeam}
            />
            {newTeamImageUrl && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Preview:</span>
                <img
                  src={newTeamImageUrl}
                  alt="Team preview"
                  className="size-6 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creatingTeam}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTeam}
              disabled={creatingTeam || !newTeamName.trim()}
            >
              {creatingTeam ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
