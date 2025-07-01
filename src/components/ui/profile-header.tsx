import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface ProfileHeaderProps {
  title?: string;
  subtitle?: string;
  username?: string;
  fieldOfWork?: string;
  showEditButton?: boolean;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

export function ProfileHeader({
  title,
  subtitle = "Your display name",
  username,
  fieldOfWork = "Your main field of work",
  showEditButton = true,
  gradientFrom = "from-orange-400",
  gradientVia = "via-pink-400",
  gradientTo = "to-purple-500",
}: ProfileHeaderProps) {
  const { user } = useSession();

  const displayTitle = title || user?.name || "User Name";
  const displayUsername = username || user?.email?.split("@")[0] || "username";

  return (
    <div className="relative">
      {/* Compact Gradient Header */}
      <div
        className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} h-32 mx-6 mt-6`}
      >
        {/* Edit Cover Image Button */}
        {showEditButton && (
          <div className="absolute top-3 right-3">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-700 text-xs h-7"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit your cover image
            </Button>
          </div>
        )}

        {/* Profile Avatar - smaller and positioned at bottom */}
        <div className="absolute -bottom-6 left-6">
          <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {displayTitle.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Profile Info */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {displayTitle}
            </h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
