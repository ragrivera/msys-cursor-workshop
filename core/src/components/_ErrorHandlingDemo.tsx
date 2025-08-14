import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processApiError } from "@/lib/error-handling";
import toast from "react-hot-toast";

/**
 * Demo component to showcase secure error handling
 * This component demonstrates how dangerous database errors are sanitized
 */
export const ErrorHandlingDemo: React.FC = () => {
  const simulateErrors = () => {
    // Simulate various types of dangerous errors that could come from the backend
    const dangerousErrors = [
      {
        name: "SQL Injection Attempt",
        error: new Error(
          "SQL Error: Duplicate entry 'test@example.com' for key 'users.email' at line 1"
        ),
      },
      {
        name: "Database Connection Error",
        error: new Error(
          "MySQL connection timeout: Could not connect to database 'beyblade_app' on server 'localhost:3306'"
        ),
      },
      {
        name: "Foreign Key Constraint",
        error: new Error(
          "Cannot add or update a child row: a foreign key constraint fails (`beyblade_app`.`appointments`, CONSTRAINT `fk_arena` FOREIGN KEY (`arena_id`) REFERENCES `arenas` (`id`))"
        ),
      },
      {
        name: "Schema Migration Error",
        error: new Error(
          "Migration failed: Table 'users' doesn't exist in schema 'beyblade_app'"
        ),
      },
      {
        name: "Internal Server Error",
        error: new Error(
          "Internal Server Error: Unhandled exception in UserController.createUser() at line 45: Cannot read property 'id' of undefined"
        ),
      },
    ];

    dangerousErrors.forEach(({ name, error }, index) => {
      setTimeout(() => {
        console.group(`🚨 ${name} (RAW - DANGEROUS)`);
        console.error(
          "Raw error that would leak sensitive info:",
          error.message
        );
        console.groupEnd();

        const processedError = processApiError(error, "CREATE_APPOINTMENT");

        console.group(`✅ ${name} (PROCESSED - SAFE)`);
        console.log("Safe error message for user:", processedError.message);
        console.log("Should retry:", processedError.shouldRetry);
        console.log("Is client error:", processedError.isClientError);
        console.groupEnd();

        toast.error(`${name}: ${processedError.message}`, {
          duration: 4000,
          position: "top-right",
        });
      }, index * 1000);
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔒 Secure Error Handling Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>
            This demo shows how our error handling system protects against
            information leakage by sanitizing dangerous database errors.
          </p>
          <p className="mt-2">
            Click the button below to simulate various backend errors and see
            how they are safely processed before being shown to users.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h4 className="font-medium text-yellow-800 mb-2">
            Security Features:
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Filters out SQL-related terms and database names</li>
            <li>• Removes server paths and stack trace information</li>
            <li>• Limits message length to prevent info leakage</li>
            <li>• Provides user-friendly fallback messages</li>
            <li>• Logs full errors in development only</li>
          </ul>
        </div>

        <Button
          onClick={simulateErrors}
          className="w-full"
          variant="destructive"
        >
          🚨 Simulate Dangerous Backend Errors
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> Open your browser's developer console to see
            the before/after comparison of error messages.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
