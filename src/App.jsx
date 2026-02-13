import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";
const Home = lazy(() => import("./pages/Home"));
const Lore = lazy(() => import("./pages/Lore"));
const CreateCharacter = lazy(() => import("./pages/CreateCharacter"));
const DashboardPlayer = lazy(() => import("./pages/DashboardPlayer"));
const Adventure = lazy(() => import("./pages/Adventure"));
const ExpeditionActive = lazy(() => import("./pages/ExpeditionActive"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Quests = lazy(() => import("./pages/Quests"));
const QuestDetail = lazy(() => import("./pages/QuestDetail"));
const Arena = lazy(() => import("./pages/Arena"));
const ArenaFight = lazy(() => import("./pages/ArenaFight"));
const ArenaOpponent = lazy(() => import("./pages/ArenaOpponent"));
const Market = lazy(() => import("./pages/Market"));
const Guild = lazy(() => import("./pages/Guild"));
const Profile = lazy(() => import("./pages/Profile"));
const EditCharacter = lazy(() => import("./pages/EditCharacter"));
const ArenaResult = lazy(() => import("./pages/ArenaResult"));
const Housing = lazy(() => import("./pages/Housing"));
const Mining = lazy(() => import("./pages/Mining"));
const MiningClick = lazy(() => import("./pages/MiningClick"));
const Farm = lazy(() => import("./pages/Farm"));
const FarmPlots = lazy(() => import("./pages/FarmPlots"));
const FarmAnimals = lazy(() => import("./pages/FarmAnimals"));
const FarmTasks = lazy(() => import("./pages/FarmTasks"));
const Workshop = lazy(() => import("./pages/Workshop"));
const Zones = lazy(() => import("./pages/Zones"));
const DevCheats = lazy(() => import("./pages/DevCheats"));
const Missions = lazy(() => import("./pages/Missions"));
const LoadSave = lazy(() => import("./pages/LoadSave"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
import ProtectedRoute from "./services/ProtectedRoute";
import { RewardFloatProvider } from "./components/RewardFloatProvider";
import InteractionFeedbackLayer from "./components/InteractionFeedbackLayer";

const OFFLINE_MODE = import.meta.env.VITE_OFFLINE_MODE === "true";
const prefetchCommonRoutes = () => {
  import("./pages/DashboardPlayer");
  import("./pages/Adventure");
  import("./pages/Market");
  import("./pages/Inventory");
};
function App() {
  useEffect(() => {
    const prefetch = () => prefetchCommonRoutes();
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = window.setTimeout(prefetch, 600);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <RewardFloatProvider>
      <InteractionFeedbackLayer />
      <Toaster />
      <Analytics />
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lore" element={<Lore />} />
          <Route path="/load-save" element={<LoadSave />} />
          <Route path="/character" element={<CreateCharacter />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adventure"
            element={
              <ProtectedRoute>
                <Adventure />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expedition-active"
            element={
              <ProtectedRoute>
                <ExpeditionActive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quests"
            element={
              <ProtectedRoute>
                <Quests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quests/:questId"
            element={
              <ProtectedRoute>
                <QuestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/arena"
            element={
              OFFLINE_MODE ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ProtectedRoute>
                  <Arena />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/arena/fight"
            element={
              OFFLINE_MODE ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ProtectedRoute>
                  <ArenaFight />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/arena/fight/opponent"
            element={
              OFFLINE_MODE ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ProtectedRoute>
                  <ArenaOpponent />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/arena/fight/result"
            element={
              OFFLINE_MODE ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ProtectedRoute>
                  <ArenaResult />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guild"
            element={
              OFFLINE_MODE ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ProtectedRoute>
                  <Guild />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/housing"
            element={
              <ProtectedRoute>
                <Housing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mining"
            element={
              <ProtectedRoute>
                <Mining />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mining/click"
            element={
              <ProtectedRoute>
                <MiningClick />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farm"
            element={
              <ProtectedRoute>
                <Farm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farm/plots"
            element={
              <ProtectedRoute>
                <FarmPlots />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farm/animals"
            element={
              <ProtectedRoute>
                <FarmAnimals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farm/tasks"
            element={
              <ProtectedRoute>
                <FarmTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workshop"
            element={
              <ProtectedRoute>
                <Workshop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/zones"
            element={
              <ProtectedRoute>
                <Zones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dev-cheats"
            element={
              <ProtectedRoute>
                <DevCheats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/missions"
            element={
              <ProtectedRoute>
                <Missions />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </RewardFloatProvider>
  );
}

export default App;
