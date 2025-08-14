import { AxiosError } from "axios";

export type ApiError = {
  message: string;
  code?: string;
  details?: Record<string, any>;
};

/**
 * Known error codes that are safe to show to users
 */
const SAFE_ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "MAINTENANCE_MODE",
] as const;

/**
 * Safe error messages for common HTTP status codes
 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input and try again.",
  401: "You need to log in to perform this action.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with existing data.",
  422: "Please check your input and try again.",
  429: "Too many requests. Please try again later.",
  500: "Something went wrong on our end. Please try again.",
  502: "Service temporarily unavailable. Please try again.",
  503: "Service temporarily unavailable. Please try again.",
  504: "Request timeout. Please try again.",
};

/**
 * Default error messages for different contexts
 */
const DEFAULT_ERROR_MESSAGES = {
  CREATE_APPOINTMENT: "Failed to create appointment. Please try again.",
  CREATE_TOURNAMENT: "Failed to create tournament. Please try again.",
  UPDATE_APPOINTMENT: "Failed to update appointment. Please try again.",
  UPDATE_TOURNAMENT: "Failed to update tournament. Please try again.",
  DELETE_APPOINTMENT: "Failed to delete appointment. Please try again.",
  DELETE_TOURNAMENT: "Failed to delete tournament. Please try again.",
  FETCH_DATA: "Failed to load data. Please refresh the page.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNKNOWN: "An unexpected error occurred. Please try again.",
} as const;

/**
 * Check if an error message contains potentially sensitive information
 */
const containsSensitiveInfo = (message: string): boolean => {
  const sensitivePatterns = [
    /sql/i,
    /database/i,
    /table/i,
    /column/i,
    /constraint/i,
    /foreign key/i,
    /primary key/i,
    /unique/i,
    /duplicate entry/i,
    /mysql/i,
    /postgresql/i,
    /sqlite/i,
    /mongodb/i,
    /redis/i,
    /server error/i,
    /internal server error/i,
    /stack trace/i,
    /at line/i,
    /syntax error/i,
    /connection/i,
    /timeout/i,
    /pool/i,
    /transaction/i,
    /rollback/i,
    /commit/i,
    /schema/i,
    /migration/i,
    /seed/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(message));
};

/**
 * Sanitize error message to remove sensitive information
 */
const sanitizeErrorMessage = (
  message: string,
  context: keyof typeof DEFAULT_ERROR_MESSAGES
): string => {
  // If the message contains sensitive info, return a generic message
  if (containsSensitiveInfo(message)) {
    return DEFAULT_ERROR_MESSAGES[context];
  }

  // Remove any potential SQL injection attempts or database-specific terms
  const sanitized = message
    .replace(/sql/gi, "query")
    .replace(/database/gi, "storage")
    .replace(/table/gi, "data")
    .replace(/column/gi, "field")
    .replace(/constraint/gi, "rule")
    .replace(/foreign key/gi, "reference")
    .replace(/primary key/gi, "identifier")
    .replace(/duplicate entry/gi, "duplicate value")
    .replace(/unique/gi, "duplicate")
    .replace(/server error/gi, "system error")
    .replace(/internal server error/gi, "system error")
    .replace(/connection/gi, "network")
    .replace(/timeout/gi, "request took too long")
    .replace(/transaction/gi, "operation")
    .replace(/rollback/gi, "operation cancelled")
    .replace(/commit/gi, "operation completed");

  // Limit message length to prevent information leakage
  if (sanitized.length > 200) {
    return DEFAULT_ERROR_MESSAGES[context];
  }

  return sanitized;
};

/**
 * Process API error and return a safe user-friendly message
 */
export const processApiError = (
  error: unknown,
  context: keyof typeof DEFAULT_ERROR_MESSAGES = "UNKNOWN"
): { message: string; shouldRetry: boolean; isClientError: boolean } => {
  console.error(`[${context}] Error:`, error);

  // Handle network errors
  if (error instanceof Error && error.message === "Network Error") {
    return {
      message: DEFAULT_ERROR_MESSAGES.NETWORK_ERROR,
      shouldRetry: true,
      isClientError: false,
    };
  }

  // Handle Axios errors
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const responseData = error.response?.data as ApiError | undefined;

    // Check if the error has a safe error code
    if (
      responseData?.code &&
      SAFE_ERROR_CODES.includes(responseData.code as any)
    ) {
      return {
        message: responseData.message || DEFAULT_ERROR_MESSAGES[context],
        shouldRetry: status ? status >= 500 : false,
        isClientError: status ? status < 500 : false,
      };
    }

    // Use HTTP status-based messages
    if (status && HTTP_STATUS_MESSAGES[status]) {
      return {
        message: HTTP_STATUS_MESSAGES[status],
        shouldRetry: status >= 500,
        isClientError: status < 500,
      };
    }

    // Sanitize any message from the response
    if (responseData?.message) {
      return {
        message: sanitizeErrorMessage(responseData.message, context),
        shouldRetry: status ? status >= 500 : false,
        isClientError: status ? status < 500 : false,
      };
    }

    // Handle request timeout
    if (error.code === "ECONNABORTED") {
      return {
        message: "Request timeout. Please try again.",
        shouldRetry: true,
        isClientError: false,
      };
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: sanitizeErrorMessage(error.message, context),
      shouldRetry: false,
      isClientError: true,
    };
  }

  // Fallback for unknown errors
  return {
    message: DEFAULT_ERROR_MESSAGES[context],
    shouldRetry: false,
    isClientError: true,
  };
};

/**
 * Extract validation errors from API response
 */
export const extractValidationErrors = (
  error: unknown
): Record<string, string> => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;

    // Handle structured validation errors
    if (responseData?.errors && typeof responseData.errors === "object") {
      const validationErrors: Record<string, string> = {};

      for (const [field, messages] of Object.entries(responseData.errors)) {
        if (Array.isArray(messages)) {
          validationErrors[field] = messages[0]; // Take first error message
        } else if (typeof messages === "string") {
          validationErrors[field] = messages;
        }
      }

      return validationErrors;
    }

    // Handle single field validation error
    if (responseData?.field && responseData?.message) {
      return {
        [responseData.field]: sanitizeErrorMessage(
          responseData.message,
          "UNKNOWN"
        ),
      };
    }
  }

  return {};
};

/**
 * Format error for display in forms
 */
export const formatFormError = (
  error: unknown,
  context: keyof typeof DEFAULT_ERROR_MESSAGES
): string => {
  const processedError = processApiError(error, context);
  return processedError.message;
};

/**
 * Check if error should trigger a retry mechanism
 */
export const shouldRetryError = (error: unknown): boolean => {
  const processedError = processApiError(error);
  return processedError.shouldRetry;
};
