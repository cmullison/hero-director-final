import { useState } from "react";

export function DevTools() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dev/dashboard");
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch dashboard data");
    }
  };

  const testError = async () => {
    try {
      const response = await fetch("/api/dev/test-error");
      const data = await response.json();
      // @ts-ignore
      setError(data.error);
    } catch (err) {
      setError("Failed to fetch error test");
    }
  };

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-2">Dev Tools</h3>
      <div className="space-y-2">
        <button
          onClick={fetchDashboardData}
          className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600"
        >
          Test Dashboard Data
        </button>
        <button
          onClick={testError}
          className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 ml-2"
        >
          Test Error
        </button>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-600 rounded">Error: {error}</div>
      )}

      {dashboardData && (
        <div className="mt-2">
          <pre className="text-xs">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
