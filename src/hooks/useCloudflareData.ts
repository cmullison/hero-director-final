import { useState, useEffect } from "react";
import type {
  ZoneInfo,
  ZoneAnalytics,
  PerformanceMetrics,
  SecurityMetrics,
  DeploymentInfo,
} from "../lib/cloudflare-api";

// API Response interfaces
interface ZonesResponse {
  zones: ZoneInfo[];
}

interface DashboardDataResponse {
  dashboardMetrics: DashboardMetrics;
  websiteData: WebsiteData[];
}

interface PurgeCacheResponse {
  success: boolean;
  message: string;
}

interface SpeedTestResponse {
  success: boolean;
  data: any;
}

interface ApiResponse {
  message?: string;
}

// Website/Zone data interface for dashboard
export interface WebsiteData {
  id: string;
  name: string;
  status: "active" | "paused" | "inactive";
  // Real analytics data (can be null if unavailable)
  requests: number | null;
  bandwidth: number | null;
  visitors: number | null;
  pageviews: number | null;
  // Performance data (can be null if unavailable)
  loadTime: number | null;
  uptime: number | null;
  // Security data (can be null if unavailable)
  threatsBlocked: number | null;
  requestsBlocked: number | null;
  sslStatus: "active" | "expired" | "expiring" | null;
  conversions: number | null;
  lastUpdated: string;
  // Availability indicators
  analyticsAvailable: boolean;
  performanceAvailable: boolean;
  securityAvailable: boolean;
}

export interface DashboardMetrics {
  // Real analytics data (can be null if unavailable)
  totalRequests: number | null;
  totalBandwidth: number | null;
  totalVisitors: number | null;
  totalPageviews: number | null;
  // Performance data (can be null if unavailable)
  totalLoadTime: number | null;
  totalUptime: number | null;
  // Security data (can be null if unavailable)
  totalThreatsBlocked: number | null;
  totalRequestsBlocked: number | null;
  // Website counts (always available)
  activeWebsites: number;
  totalWebsites: number;
  sslSecured: number;
  // Analytics availability indicators
  analyticsAvailable: number;
  performanceAvailable: number;
  securityAvailable: number;
  // Legacy fields (will be removed)
  totalConversions: number | null;
  performanceScore: number | null;
  seoHealth: number | null;
}

// Helper function to make API calls to our server
async function fetchFromAPI<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api/cloudflare/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API call failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}

// Hook for fetching all zones/websites
export function useCloudflareZones() {
  const [zones, setZones] = useState<ZoneInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchZones() {
      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Fetching Cloudflare zones from server...");

        const data = await fetchFromAPI<ZonesResponse>("zones");

        console.log(
          "✅ Zones fetched successfully:",
          data.zones?.length || 0,
          "zones"
        );
        setZones(data.zones || []);
      } catch (err) {
        console.error("❌ Error fetching zones:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch zones";
        setError(errorMessage);

        // For now, let's add some mock data so you can see the UI
        console.log("🎭 Using mock data for development...");
        setZones([
          {
            id: "mock-zone-1",
            name: "example.com",
            status: "active",
            paused: false,
            type: "full",
            development_mode: 0,
            name_servers: ["nina.ns.cloudflare.com", "walt.ns.cloudflare.com"],
            original_name_servers: ["ns1.example.com", "ns2.example.com"],
            original_registrar: "Example Registrar",
            original_dnshost: "example.com",
            modified_on: new Date().toISOString(),
            created_on: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            activated_on: new Date(
              Date.now() - 29 * 24 * 60 * 60 * 1000
            ).toISOString(),
            meta: {
              step: 4,
              wildcard_proxiable: true,
              custom_certificate_quota: 0,
              page_rule_quota: 3,
              phishing_detected: false,
              multiple_railguns_allowed: false,
            },
            plan: {
              id: "free",
              name: "Free Website",
              price: 0,
              currency: "USD",
              frequency: "",
              legacy_id: "free",
              is_subscribed: true,
              can_subscribe: false,
            },
          },
          {
            id: "mock-zone-2",
            name: "mysite.io",
            status: "active",
            paused: false,
            type: "full",
            development_mode: 0,
            name_servers: ["nina.ns.cloudflare.com", "walt.ns.cloudflare.com"],
            original_name_servers: ["ns1.mysite.io", "ns2.mysite.io"],
            original_registrar: "Domain Registrar",
            original_dnshost: "mysite.io",
            modified_on: new Date().toISOString(),
            created_on: new Date(
              Date.now() - 60 * 24 * 60 * 60 * 1000
            ).toISOString(),
            activated_on: new Date(
              Date.now() - 59 * 24 * 60 * 60 * 1000
            ).toISOString(),
            meta: {
              step: 4,
              wildcard_proxiable: true,
              custom_certificate_quota: 0,
              page_rule_quota: 3,
              phishing_detected: false,
              multiple_railguns_allowed: false,
            },
            plan: {
              id: "pro",
              name: "Pro Website",
              price: 20,
              currency: "USD",
              frequency: "monthly",
              legacy_id: "pro",
              is_subscribed: true,
              can_subscribe: false,
            },
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchZones();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await fetchFromAPI<ZonesResponse>("zones");
      setZones(data.zones || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch zones");
    } finally {
      setLoading(false);
    }
  };

  return { zones, loading, error, refetch };
}

// Hook for fetching analytics for a specific zone
export function useZoneAnalytics(zoneId: string | null) {
  const [analytics, setAnalytics] = useState<ZoneAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!zoneId) return;

    async function fetchAnalytics() {
      if (!zoneId) return; // Additional null check for TypeScript

      try {
        setLoading(true);
        // This endpoint doesn't exist yet, but would be added if needed
        // const data = await fetchFromAPI(`zones/${zoneId}/analytics`);
        // setAnalytics(data);
        setError(null);
      } catch (err) {
        console.log("Analytics fetch failed, using mock data");
        setError(
          err instanceof Error ? err.message : "Failed to fetch analytics"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [zoneId]);

  return { analytics, loading, error };
}

// Hook for fetching performance metrics
export function usePerformanceMetrics(zoneId: string | null) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!zoneId) return;

    async function fetchMetrics() {
      if (!zoneId) return; // Additional null check for TypeScript

      try {
        setLoading(true);
        // This endpoint doesn't exist yet, but would be added if needed
        // const data = await fetchFromAPI(`zones/${zoneId}/performance`);
        // setMetrics(data);
        setError(null);
      } catch (err) {
        console.log("Performance metrics fetch failed, using mock data");
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch performance metrics"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [zoneId]);

  return { metrics, loading, error };
}

// Hook for fetching security metrics
export function useSecurityMetrics(zoneId: string | null) {
  const [security, setSecurity] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!zoneId) return;

    async function fetchSecurity() {
      if (!zoneId) return; // Additional null check for TypeScript

      try {
        setLoading(true);
        // This endpoint doesn't exist yet, but would be added if needed
        // const data = await fetchFromAPI(`zones/${zoneId}/security`);
        // setSecurity(data);
        setError(null);
      } catch (err) {
        console.log("Security metrics fetch failed, using mock data");
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch security metrics"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSecurity();
  }, [zoneId]);

  return { security, loading, error };
}

// Hook for fetching deployment information
export function useDeployments(projectName?: string) {
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeployments() {
      try {
        setLoading(true);
        // This endpoint doesn't exist yet, but would be added if needed
        // const data = await fetchFromAPI(`deployments${projectName ? `?project=${projectName}` : ''}`);
        // setDeployments(data.deployments || []);
        setError(null);
        setDeployments([]);
      } catch (err) {
        console.log("Deployments fetch failed, continuing with empty array");
        setError(
          err instanceof Error ? err.message : "Failed to fetch deployments"
        );
        setDeployments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDeployments();
  }, [projectName]);

  return { deployments, loading, error };
}

// Hook for fetching dashboard data (overview metrics + website list)
export function useDashboardData() {
  const {
    zones,
    loading: zonesLoading,
    error: zonesError,
  } = useCloudflareZones();
  const [dashboardMetrics, setDashboardMetrics] =
    useState<DashboardMetrics | null>(null);
  const [websiteData, setWebsiteData] = useState<WebsiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        console.log("📊 Fetching dashboard data from server...");

        // Use the correct dashboard-data endpoint
        const data =
          await fetchFromAPI<DashboardDataResponse>("dashboard-data");

        console.log("✅ Dashboard data fetched successfully");
        console.log(
          `📈 Analytics available for ${data.dashboardMetrics.analyticsAvailable}/${data.dashboardMetrics.totalWebsites} sites`
        );

        setDashboardMetrics(data.dashboardMetrics);
        setWebsiteData(data.websiteData || []);
      } catch (err) {
        console.error("❌ Error fetching dashboard data:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch dashboard data";
        setError(errorMessage);

        // No mock data fallbacks - show error state
        setDashboardMetrics(null);
        setWebsiteData([]);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch when zones are available and not loading
    if (!zonesLoading && zones.length > 0) {
      fetchDashboardData();
    } else if (!zonesLoading && zones.length === 0) {
      // No zones available, set empty state
      setLoading(false);
      setError(zonesError || "No websites found in your Cloudflare account");
      setDashboardMetrics(null);
      setWebsiteData([]);
    }
  }, [zones, zonesLoading, zonesError]);

  return {
    dashboardMetrics,
    websiteData,
    loading: loading || zonesLoading,
    error: error || zonesError,
  };
}

// Hook for quick actions
export function useQuickActions() {
  const purgeCache = async (zoneId: string, files?: string[]) => {
    try {
      const result = await fetchFromAPI<PurgeCacheResponse>("purge-cache", {
        method: "POST",
        body: JSON.stringify({ zoneId, files }),
      });
      return result;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to purge cache",
      };
    }
  };

  const runSpeedTest = async (url: string) => {
    try {
      const result = await fetchFromAPI<SpeedTestResponse>("speed-test", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      return result;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to run speed test",
      };
    }
  };

  const getSecurityMetrics = async (zoneId: string) => {
    try {
      const result = await fetchFromAPI<{
        success: boolean;
        data: SecurityMetrics;
      }>("security-metrics", {
        method: "POST",
        body: JSON.stringify({ zoneId }),
      });
      return result;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch security metrics",
        data: null,
      };
    }
  };

  const getPerformanceMetrics = async (zoneId: string) => {
    try {
      const result = await fetchFromAPI<{
        success: boolean;
        data: PerformanceMetrics;
      }>("performance-metrics", {
        method: "POST",
        body: JSON.stringify({ zoneId }),
      });
      return result;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch performance metrics",
        data: null,
      };
    }
  };

  return {
    purgeCache,
    runSpeedTest,
    getSecurityMetrics,
    getPerformanceMetrics,
  };
}
