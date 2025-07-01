import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import type { TeamWithRole } from "@/api/teams";

interface TeamsResponse {
  success: boolean;
  teams?: TeamWithRole[];
  message?: string;
}

interface TeamResponse {
  success: boolean;
  team?: TeamWithRole;
  message?: string;
}

interface TeamContextType {
  currentTeam: TeamWithRole | null;
  allTeams: TeamWithRole[];
  teamsLoading: boolean;
  showCreateTeam: boolean;
  setCurrentTeam: (team: TeamWithRole | null) => void;
  handleTeamSwitch: (team: TeamWithRole) => void;
  setShowCreateTeam: (show: boolean) => void;
  refreshTeams: () => Promise<void>;
  createTeam: (
    name: string,
    description?: string,
    image_url?: string
  ) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}

interface TeamProviderProps {
  children: React.ReactNode;
}

export function TeamProvider({ children }: TeamProviderProps) {
  const { user } = useSession();
  const [currentTeam, setCurrentTeam] = useState<TeamWithRole | null>(null);
  const [allTeams, setAllTeams] = useState<TeamWithRole[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  // Load teams when user is available
  const refreshTeams = useCallback(async () => {
    if (!user) return;

    try {
      setTeamsLoading(true);
      const response = await fetch("/api/teams", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load teams");
      }

      const data = (await response.json()) as TeamsResponse;
      if (data.success && data.teams) {
        setAllTeams(data.teams);

        if (data.teams.length > 0 && !currentTeam) {
          const team = data.teams[0]; // Get the first/most recent team
          setCurrentTeam(team);
        }
      } else {
        setAllTeams([]);
        setCurrentTeam(null);
      }
    } catch (error) {
      toast.error("Failed to load teams");
      setAllTeams([]);
      setCurrentTeam(null);
    } finally {
      setTeamsLoading(false);
    }
  }, [user, currentTeam]);

  // Create a new team
  const createTeam = useCallback(
    async (name: string, description?: string, image_url?: string) => {
      if (!user) return;

      try {
        const response = await fetch("/api/teams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            description,
            image_url,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create team");
        }

        const data = (await response.json()) as TeamResponse;
        if (data.success && data.team) {
          // Add to allTeams and set as current
          const newTeamWithRole: TeamWithRole = {
            ...data.team,
            user_role: "owner", // Creator is always owner
            member_count: 1,
          };

          setAllTeams((prev) => [newTeamWithRole, ...prev]);
          setCurrentTeam(newTeamWithRole);
          toast.success(`Team "${name}" created successfully`);
        }
      } catch (error) {
        toast.error("Failed to create team");
        throw error;
      }
    },
    [user]
  );

  useEffect(() => {
    refreshTeams();
  }, [user]);

  const handleTeamSwitch = useCallback((team: TeamWithRole) => {
    setCurrentTeam(team);
  }, []);

  const value: TeamContextType = {
    currentTeam,
    allTeams,
    teamsLoading,
    showCreateTeam,
    setCurrentTeam,
    handleTeamSwitch,
    setShowCreateTeam,
    refreshTeams,
    createTeam,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
