import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import OrnateButton from '../components/OrnateButton';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import { ensureFarmTasks, ensureFarmWeather, farmCrops } from '../data/farmData';
import { getSeedItemId } from '../data/itemsCatalog';
import { getItemCount } from '../services/inventoryService';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
export default function Farm() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    sessionStorage.setItem('farmTasksAccess', 'true');
    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    const { nextTasks, changed: tasksChanged } = ensureFarmTasks({
      tasks: nextProfile?.farmTasks,
      farmLevel: nextProfile?.farmLevel ?? 1,
    });
    const { nextWeather, changed: weatherChanged } = ensureFarmWeather({
      weather: nextProfile?.farmWeather,
    });

    if (tasksChanged || weatherChanged) {
      const updated = characterService.updateMockProfile({
        farmTasks: nextTasks,
        farmWeather: nextWeather,
      });
      setProfile(updated);
    } else {
      setProfile(nextProfile);
    }
  }, []);

  const inventory = profile?.inventory || {};

  const seedCount = useMemo(
    () => farmCrops.reduce((sum, crop) => sum + getItemCount(inventory, getSeedItemId(crop.id)), 0),
    [inventory]
  );

  const animalCount = useMemo(() => {
    const animals = profile?.farmAnimals || {};
    return Object.values(animals).reduce((sum, entry) => sum + (entry?.count || 0), 0);
  }, [profile]);

  const farmLevel = profile?.farmLevel ?? 1;
  const farmWeather = profile?.farmWeather;
  const dailyDone = (profile?.farmTasks?.daily?.tasks || []).filter((task) => task.claimed).length;
  const dailyTotal = profile?.farmTasks?.daily?.tasks?.length || 0;
  const weeklyDone = (profile?.farmTasks?.weekly?.tasks || []).filter((task) => task.claimed).length;
  const weeklyTotal = profile?.farmTasks?.weekly?.tasks?.length || 0;
  const monthlyDone = (profile?.farmTasks?.monthly?.tasks || []).filter((task) => task.claimed).length;
  const monthlyTotal = profile?.farmTasks?.monthly?.tasks?.length || 0;

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm2.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Harvestlands</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Farmstead</h1>
              <p className="mt-3 text-base text-gray-300">
                Manage plots, collect animal goods, and sell your harvest.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-yellow-700/40 bg-gray-950/70 px-4 py-2 text-xs font-semibold text-yellow-200">
                <span className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Farm Level</span>
                <span className="text-sm font-bold text-white">{farmLevel}</span>
              </div>
            </div>
            <OrnateButton to="/dashboard" className="text-sm">
              Back to Dashboard
            </OrnateButton>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-yellow-700/30 bg-gray-950/70">
            <img
              src="/farm.png"
              alt="Farmstead"
              className="h-48 w-full object-cover sm:h-56"
            />
          </div>

          {farmWeather && (
            <div className="mt-6 rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Today</p>
              <p className="mt-2 text-base font-semibold text-white">
                {farmWeather.label} · {farmWeather.season}
              </p>
              <p className="mt-2 text-sm text-gray-300">
                Grow time x{farmWeather.growMultiplier} · Yield x{farmWeather.yieldMultiplier}
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              to="/farm/plots"
              className="hint-wrap farm-hub-card farm-hub-card--plots rounded-2xl p-5"
            >
              <span className="farm-hub-card__meta inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
                Seeds owned: {seedCount}
              </span>
            </Link>
            <Link
              to="/farm/animals"
              className="hint-wrap farm-hub-card farm-hub-card--animals rounded-2xl p-5"
            >
              <span className="farm-hub-card__meta inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
                Animals owned: {animalCount}
              </span>
            </Link>
            <Link
              to="/farm/tasks"
              className="hint-wrap farm-hub-card farm-hub-card--tasks rounded-2xl p-5"
              onClick={() => sessionStorage.setItem('farmTasksAccess', 'true')}
            >
              <span className="farm-hub-card__meta inline-flex flex-wrap gap-2 text-xs text-yellow-200">
                <span className="rounded-full bg-yellow-500/10 px-3 py-1">Daily {dailyDone}/{dailyTotal}</span>
                <span className="rounded-full bg-yellow-500/10 px-3 py-1">Weekly {weeklyDone}/{weeklyTotal}</span>
                <span className="rounded-full bg-yellow-500/10 px-3 py-1">Monthly {monthlyDone}/{monthlyTotal}</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
