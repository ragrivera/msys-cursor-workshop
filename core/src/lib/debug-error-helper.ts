/**
 * Debug helper for troubleshooting API errors in development
 * This helps developers understand what's happening when errors occur
 */

export const debugApiError = (error: unknown, context: string) => {
  if (import.meta.env.DEV) {
    console.group(`🐛 Debug API Error - ${context}`);

    // Log the full error object
    console.log("Full error object:", error);

    // If it's an Axios error, extract more details
    if (error && typeof error === "object" && "isAxiosError" in error) {
      const axiosError = error as any;

      console.log("📡 Request Details:");
      console.log("- URL:", axiosError.config?.url);
      console.log("- Method:", axiosError.config?.method?.toUpperCase());
      console.log("- Headers:", axiosError.config?.headers);
      console.log("- Data:", axiosError.config?.data);

      console.log("📥 Response Details:");
      console.log("- Status:", axiosError.response?.status);
      console.log("- Status Text:", axiosError.response?.statusText);
      console.log("- Response Headers:", axiosError.response?.headers);
      console.log("- Response Data:", axiosError.response?.data);

      if (axiosError.code) {
        console.log("🔧 Error Code:", axiosError.code);
      }

      if (axiosError.message) {
        console.log("💬 Error Message:", axiosError.message);
      }
    }

    // Log the stack trace if available
    if (error instanceof Error && error.stack) {
      console.log("📚 Stack Trace:", error.stack);
    }

    console.groupEnd();
  }
};

/**
 * Enhanced error logging for development
 */
export const logDetailedError = (
  error: unknown,
  context: string,
  additionalData?: Record<string, any>
) => {
  if (import.meta.env.DEV) {
    console.group(`🚨 Detailed Error Log - ${context}`);

    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("🏷️ Context:", context);

    if (additionalData) {
      console.log("📋 Additional Data:", additionalData);
    }

    debugApiError(error, context);

    // Suggestions based on common error patterns
    if (error && typeof error === "object" && "response" in error) {
      const response = (error as any).response;

      console.log("💡 Troubleshooting Suggestions:");

      if (response?.status === 500) {
        console.log("- Check server logs for internal server errors");
        console.log("- Verify database connection");
        console.log("- Check for missing environment variables");
        console.log("- Validate request payload structure");
      } else if (response?.status === 404) {
        console.log("- Verify API endpoint URL is correct");
        console.log("- Check if the route exists on the server");
        console.log("- Ensure the resource ID is valid");
      } else if (response?.status === 401) {
        console.log("- Check authentication token");
        console.log("- Verify token hasn't expired");
        console.log("- Ensure proper Authorization header format");
      } else if (response?.status === 422) {
        console.log("- Check request payload validation");
        console.log("- Verify required fields are present");
        console.log("- Check data types match API expectations");
      }
    }

    if (error && typeof error === "object" && "code" in error) {
      const code = (error as any).code;
      if (code === "ECONNABORTED") {
        console.log("- Request timed out - check network connection");
        console.log("- Consider increasing timeout values");
      } else if (code === "ECONNREFUSED") {
        console.log("- Server is not running or not accessible");
        console.log("- Check server URL and port");
      }
    }

    console.groupEnd();
  }
};
