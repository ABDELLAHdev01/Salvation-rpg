import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./core/styles/App.css";
import "./core/styles/styles.css";
const Home = lazy(() => import("./pages/Home"));
const Lore = lazy(() => import("./features/lore/LorePage"));
const CreateCharacter = lazy(() => import("./features/character/CreateCharacterPage"));
const DashboardPlayer = lazy(() => import("./features/dashboard/DashboardPage"));
const Adventure = lazy(() => import("./features/adventure/AdventurePage"));
const ExpeditionActive = lazy(() => import("./features/adventure/ExpeditionActivePage"));
const Inventory = lazy(() => import("./features/character/InventoryPage"));
const Quests = lazy(() => import("./features/quests/QuestsPage"));
const QuestDetail = lazy(() => import("./features/quests/QuestDetailPage"));
const Arena = lazy(() => import("./features/combat/ArenaPage"));
const ArenaFight = lazy(() => import("./features/combat/ArenaFightPage"));
const ArenaOpponent = lazy(() => import("./features/combat/ArenaOpponentPage"));
const Market = lazy(() => import("./features/market/MarketPage"));
const Guild = lazy(() => import("./features/guild/GuildPage"));
const Profile = lazy(() => import("./features/profile/ProfilePage"));
const EditCharacter = lazy(() => import("./features/character/EditCharacterPage"));
const ArenaResult = lazy(() => import("./features/combat/ArenaResultPage"));
const Housing = lazy(() => import("./features/housing/HousingPage"));
const Mining = lazy(() => import("./features/mining/MiningPage"));
const MiningClick = lazy(() => import("./features/mining/MiningClickPage"));
const Farm = lazy(() => import("./features/farm/FarmPage"));
const FarmPlots = lazy(() => import("./features/farm/FarmPlotsPage"));
const FarmAnimals = lazy(() => import("./features/farm/FarmAnimalsPage"));
const FarmTasks = lazy(() => import("./features/farm/FarmTasksPage"));
const Workshop = lazy(() => import("./features/workshop/WorkshopPage"));
const DevCheats = lazy(() => import("./features/system/DevCheatsPage"));
const Missions = lazy(() => import("./features/missions/MissionsPage"));
const LoadSave = lazy(() => import("./features/system/LoadSavePage"));
const PageNotFound = lazy(() => import("./shared/layout/PageNotFound"));
import ProtectedRoute from "./core/services/ProtectedRoute";
import { RewardFloatProvider } from "./shared/feedback/RewardFloatProvider";
import InteractionFeedbackLayer from "./shared/feedback/InteractionFeedbackLayer";

const OFFLINE_MODE = import.meta.env.VITE_OFFLINE_MODE === "true";
const prefetchCommonRoutes = () => {
  import("./features/dashboard/DashboardPage");
  import("./features/adventure/AdventurePage");
  import("./features/market/MarketPage");
  import("./features/character/InventoryPage");
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
      <SpeedInsights />
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
