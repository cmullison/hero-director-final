import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./lib/private-route";

// Lazy load all major route components
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));

// Dashboard pages
const DashboardMain = lazy(() => import("./pages/dashboard/Dashboard"));
const DashboardAnalytics = lazy(() => import("./pages/dashboard/Analytics"));
const DashboardUsage = lazy(() => import("./pages/dashboard/Usage"));
const DashboardPrompts = lazy(() => import("./pages/dashboard/Prompts"));
const DashboardAssets = lazy(() => import("./pages/dashboard/Assets"));
const DashboardManageProjects = lazy(
  () => import("./pages/dashboard/Manage-Projects")
);
const DashboardModels = lazy(() => import("./pages/dashboard/Models"));
const DashboardProject = lazy(() => import("./pages/dashboard/Project"));
const DashboardSandbox = lazy(() => import("./pages/dashboard/Sandbox"));
const Dashboard = lazy(() => import("./pages/dashboard/Index"));
const DashboardContentCreation = lazy(
  () => import("./pages/dashboard/Content-Creation")
);
const DashboardEditor = lazy(() => import("./pages/dashboard/Editor"));
const DashboardAnthropic = lazy(
  () => import("./pages/dashboard/AnthropicPatterns")
);
const R2Storage = lazy(() => import("./pages/dashboard/R2Storage"));
const DashboardLit = lazy(() => import("./pages/dashboard/Lit"));
const McpClient = lazy(() => import("./pages/dashboard/McpClient"));
const DashboardChat = lazy(() => import("./pages/dashboard/Chat"));
// Agents
const AgentsConversations = lazy(
  () => import("./pages/dashboard/Conversations")
);
const SandboxFluxSchnell = lazy(() => import("./pages/dashboard/Flux-Schnell"));

const SandboxVideoGeneration = lazy(
  () => import("./pages/dashboard/Video-Generation")
);
const SandboxGPTImageGeneration = lazy(
  () => import("./pages/dashboard/Gpt-Image")
);
// Settings & Support
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const Support = lazy(() => import("./pages/dashboard/Support"));
const Feedback = lazy(() => import("./pages/dashboard/Feedback"));
const UserProfile = lazy(() => import("./pages/user/user-profile"));
const GitHubIntegration = lazy(() => import("./pages/GitHubIntegration"));
const GitHubOAuthCallback = lazy(() => import("./pages/GitHubOAuthCallback"));
const Issues = lazy(() => import("./pages/dashboard/Issues"));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Wrapper component for Suspense
// @ts-ignore
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <SuspenseWrapper>
                <Index />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/login"
            element={
              <SuspenseWrapper>
                <Login />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/signup"
            element={
              <SuspenseWrapper>
                <Signup />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <SuspenseWrapper>
                  <Dashboard />
                </SuspenseWrapper>
              </PrivateRoute>
            }
          >
            {/* Dashboard Routes */}
            <Route
              path="overview"
              element={
                <SuspenseWrapper>
                  <AgentsConversations />
                </SuspenseWrapper>
              }
            />
            {/*             <Route
              path="analytics"
              element={
                <SuspenseWrapper>
                  <DashboardAnalytics />
                </SuspenseWrapper>
              }
            /> */}
            <Route
              path="usage"
              element={
                <SuspenseWrapper>
                  <DashboardUsage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="prompts"
              element={
                <SuspenseWrapper>
                  <DashboardPrompts />
                </SuspenseWrapper>
              }
            />
            <Route
              path="content-creation"
              element={
                <SuspenseWrapper>
                  <DashboardContentCreation />
                </SuspenseWrapper>
              }
            />
            <Route
              path="analytics"
              element={
                <SuspenseWrapper>
                  <DashboardLit />
                </SuspenseWrapper>
              }
            />
            <Route
              path="anthropic"
              element={
                <SuspenseWrapper>
                  <DashboardAnthropic />
                </SuspenseWrapper>
              }
            />
            <Route
              path="assets"
              element={
                <SuspenseWrapper>
                  <DashboardAssets />
                </SuspenseWrapper>
              }
            />
            <Route
              path="manage-projects"
              element={
                <SuspenseWrapper>
                  <DashboardManageProjects />
                </SuspenseWrapper>
              }
            />
            <Route
              path="models"
              element={
                <SuspenseWrapper>
                  <DashboardModels />
                </SuspenseWrapper>
              }
            />
            <Route
              path="project"
              element={
                <SuspenseWrapper>
                  <DashboardProject />
                </SuspenseWrapper>
              }
            />
            <Route
              path="r2-storage"
              element={
                <SuspenseWrapper>
                  <R2Storage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="mcp-client"
              element={
                <SuspenseWrapper>
                  <McpClient />
                </SuspenseWrapper>
              }
            />
            <Route
              path="github"
              element={
                <SuspenseWrapper>
                  <GitHubIntegration />
                </SuspenseWrapper>
              }
            />
            <Route
              path="issues"
              element={
                <SuspenseWrapper>
                  <Issues />
                </SuspenseWrapper>
              }
            />
            <Route
              path="github/callback"
              element={
                <SuspenseWrapper>
                  <GitHubOAuthCallback />
                </SuspenseWrapper>
              }
            />
            <Route
              path="sandbox"
              element={
                <SuspenseWrapper>
                  <DashboardSandbox />
                </SuspenseWrapper>
              }
            />
            <Route
              path="editor"
              element={
                <SuspenseWrapper>
                  <DashboardEditor />
                </SuspenseWrapper>
              }
            />
            <Route
              path="chat"
              element={
                <SuspenseWrapper>
                  <DashboardChat />
                </SuspenseWrapper>
              }
            />
            {/* Profile Route */}
            <Route
              path="profile"
              element={
                <SuspenseWrapper>
                  <UserProfile />
                </SuspenseWrapper>
              }
            />

            {/* Sandbox Routes */}
            <Route path="sandbox">
              <Route index />

              <Route
                path="flux-schnell"
                element={
                  <SuspenseWrapper>
                    <SandboxFluxSchnell />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="video-generation"
                element={
                  <SuspenseWrapper>
                    <SandboxVideoGeneration />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="gpt-image"
                element={
                  <SuspenseWrapper>
                    <SandboxGPTImageGeneration />
                  </SuspenseWrapper>
                }
              />
            </Route>
            {/* Agents Routes */}
            <Route path="agents">
              <Route
                index
                element={
                  <SuspenseWrapper>
                    <AgentsConversations />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="conversations"
                element={
                  <SuspenseWrapper>
                    <AgentsConversations />
                  </SuspenseWrapper>
                }
              />
            </Route>

            {/* Settings, Support, Feedback Routes */}
            <Route
              path="settings"
              element={
                <SuspenseWrapper>
                  <Settings />
                </SuspenseWrapper>
              }
            />
            <Route
              path="support"
              element={
                <SuspenseWrapper>
                  <Support />
                </SuspenseWrapper>
              }
            />
            <Route
              path="feedback"
              element={
                <SuspenseWrapper>
                  <Feedback />
                </SuspenseWrapper>
              }
            />

            {/* Default dashboard view */}
            <Route
              index
              element={
                <SuspenseWrapper>
                  <DashboardMain />
                </SuspenseWrapper>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
