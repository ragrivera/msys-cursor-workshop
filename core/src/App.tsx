import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  Beyblade Appointments
                </h1>
                <p className="text-muted-foreground">
                  Tournament Management System
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Phase 0 - Boilerplate Ready ✅
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
