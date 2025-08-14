import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/_Layout";
import { ProtectedRoute, PublicRoute } from "@/components";
import { protectedRoutes, publicRoutes } from "@/router/routes";
import { AuthProvider } from "@/contexts/auth-context";

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PublicRoute>
                  <route.element />
                </PublicRoute>
              }
            />
          ))}

          {/* Protected Routes */}
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute>
                  <Layout>
                    <route.element />
                  </Layout>
                </ProtectedRoute>
              }
            />
          ))}
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
