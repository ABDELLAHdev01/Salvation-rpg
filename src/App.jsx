import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./core/styles/App.css";
import "./core/styles/styles.css";

const WorldPage = lazy(() => import("./features/world/WorldPage"));
const CreateCharacter = lazy(() => import("./features/character/CreateCharacterPage"));

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#090a0f',
            color: '#fef08a',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            fontFamily: 'serif',
          },
        }}
      />
      <Analytics />
      <SpeedInsights />
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-gray-950 text-yellow-400 font-serif flex items-center justify-center text-lg">
            Entering the 2D Fantasy World...
          </div>
        }
      >
        <Routes>
          {/* Main 2D World Game Application */}
          <Route path="/" element={<WorldPage />} />
          <Route path="/world" element={<WorldPage />} />
          <Route path="/character" element={<CreateCharacter />} />

          {/* All legacy web-card routes redirect directly into the 2D World */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/adventure" element={<Navigate to="/" replace />} />
          <Route path="/expedition-active" element={<Navigate to="/" replace />} />
          <Route path="/inventory" element={<Navigate to="/" replace />} />
          <Route path="/character/edit" element={<Navigate to="/" replace />} />
          <Route path="/quests" element={<Navigate to="/" replace />} />
          <Route path="/quests/*" element={<Navigate to="/" replace />} />
          <Route path="/chronicle" element={<Navigate to="/" replace />} />
          <Route path="/arena" element={<Navigate to="/" replace />} />
          <Route path="/arena/*" element={<Navigate to="/" replace />} />
          <Route path="/market" element={<Navigate to="/" replace />} />
          <Route path="/guild" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<Navigate to="/" replace />} />
          <Route path="/housing" element={<Navigate to="/" replace />} />
          <Route path="/mining" element={<Navigate to="/" replace />} />
          <Route path="/mining/*" element={<Navigate to="/" replace />} />
          <Route path="/farm" element={<Navigate to="/" replace />} />
          <Route path="/farm/*" element={<Navigate to="/" replace />} />
          <Route path="/workshop" element={<Navigate to="/" replace />} />
          <Route path="/dev-cheats" element={<Navigate to="/" replace />} />
          <Route path="/missions" element={<Navigate to="/" replace />} />
          <Route path="/load-save" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/lore" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
