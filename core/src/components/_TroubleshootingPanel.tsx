import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

export const TroubleshootingPanel: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<{
    status: "checking" | "online" | "offline" | "error";
    message: string;
  }>({ status: "checking", message: "Checking..." });

  const checkApiStatus = async () => {
    setApiStatus({ status: "checking", message: "Checking API status..." });

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

    try {
      // Try to hit a health check endpoint or any simple endpoint
      const response = await fetch(`${API_BASE}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setApiStatus({
          status: "online",
          message: `API is online (${response.status})`,
        });
      } else {
        setApiStatus({
          status: "error",
          message: `API returned ${response.status}: ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error("API health check failed:", error);
      setApiStatus({
        status: "offline",
        message: `API is offline or unreachable: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };

  const getStatusIcon = () => {
    switch (apiStatus.status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "offline":
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "checking":
        return <Info className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (apiStatus.status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
      case "error":
        return "bg-red-100 text-red-800";
      case "checking":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const commonIssues = [
    {
      issue: "Server not running",
      solution: "Check if your backend server is running on the correct port",
      command: "npm run dev (or your server start command)",
    },
    {
      issue: "Wrong API URL",
      solution: "Verify VITE_API_BASE_URL in your .env file",
      command: `Current: ${import.meta.env.VITE_API_BASE_URL || "/api"}`,
    },
    {
      issue: "CORS issues",
      solution: "Ensure your backend allows requests from your frontend domain",
      command: "Check server CORS configuration",
    },
    {
      issue: "Database connection",
      solution: "Verify database is running and connection string is correct",
      command: "Check database logs",
    },
    {
      issue: "Missing environment variables",
      solution: "Check if all required environment variables are set",
      command: "Review .env file",
    },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          API Troubleshooting Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Status Check */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">API Status</h3>
            <Button onClick={checkApiStatus} size="sm" variant="outline">
              Check Status
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>{apiStatus.message}</Badge>
          </div>
        </div>

        {/* Environment Info */}
        <div className="space-y-2">
          <h3 className="font-medium">Environment Information</h3>
          <div className="bg-gray-50 rounded-md p-3 space-y-1 text-sm">
            <div>
              <strong>Mode:</strong> {import.meta.env.MODE}
            </div>
            <div>
              <strong>Dev Mode:</strong> {import.meta.env.DEV ? "Yes" : "No"}
            </div>
            <div>
              <strong>API Base URL:</strong>{" "}
              {import.meta.env.VITE_API_BASE_URL || "/api"}
            </div>
            <div>
              <strong>Base URL:</strong> {import.meta.env.BASE_URL}
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="space-y-3">
          <h3 className="font-medium">Common Issues & Solutions</h3>
          <div className="space-y-3">
            {commonIssues.map((item, index) => (
              <div key={index} className="border rounded-md p-3 space-y-2">
                <div className="font-medium text-red-600">{item.issue}</div>
                <div className="text-sm text-gray-600">{item.solution}</div>
                <div className="text-xs bg-gray-100 rounded px-2 py-1 font-mono">
                  {item.command}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            Debug Instructions:
          </h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Open your browser's Developer Console (F12)</li>
            <li>Try creating an appointment or tournament</li>
            <li>Look for detailed error logs in the console</li>
            <li>Check the Network tab for failed requests</li>
            <li>Verify the request payload and response</li>
          </ol>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            🔄 Reload Page
          </Button>
          <Button
            onClick={() => localStorage.clear()}
            variant="outline"
            size="sm"
          >
            🗑️ Clear Local Storage
          </Button>
          <Button
            onClick={() => {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker
                  .getRegistrations()
                  .then((registrations) => {
                    registrations.forEach((registration) =>
                      registration.unregister()
                    );
                  });
              }
            }}
            variant="outline"
            size="sm"
          >
            🧹 Clear Service Workers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
