"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VideoGenerator } from "../sandbox/video-generator";
import { KlingVideoGenerator } from "../sandbox/kling-video-generator";
import { GoogleVideoGenerator } from "../sandbox/google-video-generator";
import Tabs from "@/components/ui/tabs";

const videoPageTabs = ["Google Veo-3", "Google Gemini", "Kling v2.0"];

export default function VideoGeneration() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [startImageFromSettings, setStartImageFromSettings] = useState<
    string | null
  >(null);

  const handleTabChange = useCallback((index: number) => {
    setActiveTabIndex(index);
  }, []);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-primary">
          Video Generator
        </h2>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={videoPageTabs}
        onTabChange={handleTabChange}
        initialActiveIndex={activeTabIndex}
      />

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTabIndex === 0 && (
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-5">
              <CardHeader>
                <CardTitle>Google Veo-3 Video Generator</CardTitle>
                <CardDescription>
                  Generate videos from text prompts using Google's Veo-3 model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideoGenerator seed={seed} />
              </CardContent>
            </Card>

            <div className="col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generation Settings</CardTitle>
                  <CardDescription>
                    Configure your video generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seed">
                      Seed (Optional)
                      <span className="text-xs text-muted-foreground ml-2">
                        Use the same seed to reproduce results
                      </span>
                    </Label>
                    <Input
                      id="seed"
                      type="number"
                      placeholder="Leave empty for random"
                      value={seed || ""}
                      onChange={(e) =>
                        setSeed(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        setSeed(Math.floor(Math.random() * 1000000000))
                      }
                    >
                      Generate Random Seed
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About Veo-3</CardTitle>
                  <CardDescription>
                    Google's video generation model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Veo-3 generates high-quality videos from text descriptions.
                    Simply describe what you want to see, and the model will
                    create a video based on your prompt.
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium">
                      Tips for better results:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Be specific about actions and movements</li>
                      <li>Describe the scene and environment</li>
                      <li>Include style references if needed</li>
                      <li>Keep prompts clear and concise</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTabIndex === 1 && (
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-5">
              <CardHeader>
                <CardTitle>Google API Video Generator</CardTitle>
                <CardDescription>
                  Generate videos from text prompts using Google's API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoogleVideoGenerator />
              </CardContent>
            </Card>

            <div className="col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generation Settings</CardTitle>
                  <CardDescription>
                    Configure your video generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seed">
                      Seed (Optional)
                      <span className="text-xs text-muted-foreground ml-2">
                        Use the same seed to reproduce results
                      </span>
                    </Label>
                    <Input
                      id="seed"
                      type="number"
                      placeholder="Leave empty for random"
                      value={seed || ""}
                      onChange={(e) =>
                        setSeed(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        setSeed(Math.floor(Math.random() * 1000000000))
                      }
                    >
                      Generate Random Seed
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About Veo-3</CardTitle>
                  <CardDescription>
                    Google's video generation model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Veo-3 generates high-quality videos from text descriptions.
                    Simply describe what you want to see, and the model will
                    create a video based on your prompt.
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium">
                      Tips for better results:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Be specific about actions and movements</li>
                      <li>Describe the scene and environment</li>
                      <li>Include style references if needed</li>
                      <li>Keep prompts clear and concise</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTabIndex === 2 && (
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-5">
              <CardHeader>
                <CardTitle>Kling v2.0 Video Generator</CardTitle>
                <CardDescription>
                  Generate videos from text prompts using Kling's advanced AI
                  model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KlingVideoGenerator
                  onStartImageChange={setStartImageFromSettings}
                />
              </CardContent>
            </Card>

            <div className="col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About Kling v2.0</CardTitle>
                  <CardDescription>
                    Professional video generation model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Kling v2.0 generates high-quality videos with advanced
                    controls for professional results. Customize duration,
                    aspect ratio, and more to get exactly what you need.
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium">Key features:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>5 or 10 second video generation</li>
                      <li>Multiple aspect ratios (16:9, 9:16, 1:1)</li>
                      <li>Negative prompts for better control</li>
                      <li>CFG scale for prompt adherence</li>
                      <li>Optional start image for consistency</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generation Tips</CardTitle>
                  <CardDescription>Get the best results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-1">Prompting:</p>
                    <p className="text-xs text-muted-foreground">
                      Be specific about camera movements, subjects, and scene
                      details. Include style references for consistent
                      aesthetics.
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-1">CFG Scale:</p>
                    <p className="text-xs text-muted-foreground">
                      Lower values (0.0-0.3) give more creative freedom. Higher
                      values (0.7-1.0) follow prompts more strictly.
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-1">Start Image:</p>
                    <p className="text-xs text-muted-foreground">
                      Use a start image to maintain visual consistency or
                      continue from a specific scene. The aspect ratio will
                      match the image.
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-1">
                      Negative Prompts:
                    </p>
                    <p className="text-xs text-muted-foreground">
                      List unwanted elements like "blurry, low quality,
                      watermark" to improve output quality.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
