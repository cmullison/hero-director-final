import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Tabs from "@/components/ui/tabs";
import {
  Instagram,
  Twitter,
  Linkedin,
  Github,
  MapPin,
  Mail,
  Phone,
  Globe,
  User,
  Save,
  Loader2,
} from "lucide-react";
import { getApiUrl, apiFetch } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/api/profile";

export function UserProfile() {
  const { user } = useSession();
  const { toast } = useToast();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab names
  const profileTabs = ["Profile", "Account", "Notifications"];

  // Profile state
  const [profile, setProfile] = useState<Profile & { email: string }>({
    user_id: user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    github: "",
    avatar_url: user?.image || "",
  });

  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  // Fetch profile data
  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await apiFetch<Profile>(getApiUrl("/api/profile"));

        if (response.profile) {
          setProfile({
            ...profile,
            ...response.profile,
            email: user?.email || "",
            name: response.profile.name || user?.name || "",
            avatar_url: response.profile.avatar_url || user?.image || "",
          });
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      const response = await apiFetch<Profile>(getApiUrl("/api/profile"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          name: profile.name,
          bio: profile.bio,
          phone: profile.phone,
          location: profile.location,
          website: profile.website,
          twitter: profile.twitter,
          instagram: profile.instagram,
          linkedin: profile.linkedin,
          github: profile.github,
          avatar_url: profile.avatar_url,
        }),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });

        // Update profile with the returned data if available
        if (response.profile) {
          setProfile((prev) => ({
            ...prev,
            ...response.profile,
            email: user.email || "",
          }));
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        {/* keep text-primary */}
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-primary">
          User Profile
        </h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-9">
            Save Profile
          </Button>
          <Button size="sm" className="h-9">
            Upgrade to Pro
          </Button>
        </div>
      </div>
      <Tabs
        tabs={profileTabs}
        onTabChange={handleTabChange}
        initialActiveIndex={activeTabIndex}
      />
      <div className="space-y-8 mt-6">
        {activeTabIndex === 0 && (
          <>
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading profile...</span>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                {error}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal information and contact details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage
                            className="aspect-auto object-cover"
                            src={profile.avatar_url || ""}
                            alt={profile.name}
                          />
                          <AvatarFallback className="text-xl">
                            {profile.name ? getInitials(profile.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Button variant="outline" size="sm">
                            Change avatar
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={profile.name || ""}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profile.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={profile.phone || ""}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="location"
                              name="location"
                              value={profile.location || ""}
                              onChange={handleChange}
                              className="pl-9"
                              placeholder="Enter your location"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={profile.bio || ""}
                            onChange={handleChange}
                            placeholder="Write a short bio about yourself"
                            rows={4}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Social Links</CardTitle>
                      <CardDescription>
                        Add your social media profiles.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="website"
                              name="website"
                              value={profile.website || ""}
                              onChange={handleChange}
                              className="pl-9"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitter">Twitter</Label>
                          <div className="relative">
                            <Twitter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="twitter"
                              name="twitter"
                              value={profile.twitter || ""}
                              onChange={handleChange}
                              className="pl-9"
                              placeholder="@username"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instagram">Instagram</Label>
                          <div className="relative">
                            <Instagram className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="instagram"
                              name="instagram"
                              value={profile.instagram || ""}
                              onChange={handleChange}
                              className="pl-9"
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <div className="relative">
                            <Linkedin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="linkedin"
                              name="linkedin"
                              value={profile.linkedin || ""}
                              onChange={handleChange}
                              className="pl-9"
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github">GitHub</Label>
                          <div className="relative">
                            <Github className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="github"
                              name="github"
                              value={profile.github || ""}
                              onChange={handleChange}
                              className="pl-9"
                              placeholder="username"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </form>
            )}
          </>
        )}

        {activeTabIndex === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account settings will go here.</p>
            </CardContent>
          </Card>
        )}

        {activeTabIndex === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notification settings will go here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
