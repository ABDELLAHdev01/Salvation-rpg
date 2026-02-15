import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { ensureFarmTasks, farmGoods, getFarmXpForLevel } from '../../core/data/farmData';
import { getItemCount, removeItems } from '../../core/services/inventoryService';

import FarmStatCard from './FarmStatCard';
import FarmTaskGroup from './FarmTaskGroup';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const getGoodName = (goodId) => farmGoods.find((good) => good.id === goodId)?.name || 'Goods';

export default function FarmTasks() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    const canAccess = sessionStorage.getItem('farmTasksAccess') === 'true';
    if (!canAccess) {
      navigate('/farm', { replace: true });
      return;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    const { nextTasks, changed } = ensureFarmTasks({
      tasks: nextProfile?.farmTasks,
      farmLevel: nextProfile?.farmLevel ?? 1,
    });

    if (changed) {
      const updated = characterService.updateMockProfile({ farmTasks: nextTasks });
      setProfile(updated);
    } else {
      setProfile(nextProfile);
    }
  }, [navigate]);

  const farmLevel = profile?.farmLevel ?? 1;
  const farmXp = profile?.farmXp ?? 0;
  const gold = profile?.stats?.gold ?? 0;
  const inventory = profile?.inventory || {};
  const farmXpTarget = getFarmXpForLevel(farmLevel);

  const tasks = useMemo(() => profile?.farmTasks || {}, [profile?.farmTasks]);
  const dailyTasks = useMemo(() => tasks.daily?.tasks || [], [tasks.daily?.tasks]);
  const weeklyTasks = useMemo(() => tasks.weekly?.tasks || [], [tasks.weekly?.tasks]);
  const monthlyTasks = useMemo(() => tasks.monthly?.tasks || [], [tasks.monthly?.tasks]);

  const totals = useMemo(() => {
    const countClaimed = (list) => list.filter((task) => task.claimed).length;
    return {
      daily: { done: countClaimed(dailyTasks), total: dailyTasks.length },
      weekly: { done: countClaimed(weeklyTasks), total: weeklyTasks.length },
      monthly: { done: countClaimed(monthlyTasks), total: monthlyTasks.length },
    };
  }, [dailyTasks, weeklyTasks, monthlyTasks]);

  const applyFarmXp = (xpGain) => {
    let nextLevel = farmLevel;
    let nextXp = farmXp + xpGain;
    let target = getFarmXpForLevel(nextLevel);
    let leveledUp = false;

    while (nextXp >= target) {
      nextXp -= target;
      nextLevel += 1;
      target = getFarmXpForLevel(nextLevel);
      leveledUp = true;
    }

    return { nextLevel, nextXp, leveledUp };
  };

  const handleDeliver = (period, taskId) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const currentTasks = tasks[period]?.tasks || [];
    const taskIndex = currentTasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      return;
    }

    const task = currentTasks[taskIndex];
    if (task.claimed) {
      toast('Task already complete.', { icon: '✅' });
      return;
    }

    const owned = getItemCount(inventory, task.goodId);
    const remaining = Math.max(0, task.target - task.progress);
    const deliverAmount = Math.min(owned, remaining);

    if (deliverAmount <= 0) {
      toast.error('Not enough goods to deliver.');
      return;
    }

    const nextInventory = removeItems(inventory, { [task.goodId]: deliverAmount });

    const nextTasks = { ...tasks };
    const updatedTask = {
      ...task,
      progress: task.progress + deliverAmount,
    };

    if (updatedTask.progress >= updatedTask.target) {
      updatedTask.completed = true;
      updatedTask.claimed = true;
    }

    const periodTasks = [...currentTasks];
    periodTasks[taskIndex] = updatedTask;
    nextTasks[period] = { ...tasks[period], tasks: periodTasks };

    let nextStats = profile.stats;
    let nextFarmLevel = farmLevel;
    let nextFarmXp = farmXp;

    if (updatedTask.claimed) {
      const { nextLevel, nextXp, leveledUp } = applyFarmXp(updatedTask.rewardXp);
      nextFarmLevel = nextLevel;
      nextFarmXp = nextXp;
      nextStats = {
        ...profile.stats,
        gold: gold + updatedTask.rewardGold,
      };
      toast.success(
        `Delivered ${updatedTask.target} ${getGoodName(updatedTask.goodId)} · +${updatedTask.rewardGold}g${leveledUp ? ' · Farm level up!' : ''
        }`
      );
    } else {
      toast.success(`Delivered ${deliverAmount} ${getGoodName(updatedTask.goodId)}.`);
    }

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      farmTasks: nextTasks,
      farmLevel: nextFarmLevel,
      farmXp: nextFarmXp,
      stats: nextStats,
    });

    setProfile(updated);
  };

  if (!MOCK_AUTH) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-6">
        Farm tasks are available only in offline mode.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm2.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Harvestlands</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Farm Tasks</h1>
              <p className="mt-3 text-base text-gray-300">
                Deliver goods from your inventory to earn farm XP and gold.
              </p>
            </div>
            <Link
              to="/farm"
              onClick={() => sessionStorage.setItem('farmTasksAccess', 'true')}
              className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
            >
              Back to Farm
            </Link>
          </div>

          <FarmStatCard
            farmLevel={farmLevel}
            farmXp={farmXp}
            farmXpTarget={farmXpTarget}
            gold={gold}
            inventory={inventory}
          />

          <div className="mt-8 space-y-6">
            <FarmTaskGroup
              label="Daily Orders"
              periodKey="daily"
              tasks={dailyTasks}
              doneCount={totals.daily.done}
              totalCount={totals.daily.total}
              inventory={inventory}
              handleDeliver={handleDeliver}
            />
            <FarmTaskGroup
              label="Weekly Orders"
              periodKey="weekly"
              tasks={weeklyTasks}
              doneCount={totals.weekly.done}
              totalCount={totals.weekly.total}
              inventory={inventory}
              handleDeliver={handleDeliver}
            />
            <FarmTaskGroup
              label="Monthly Orders"
              periodKey="monthly"
              tasks={monthlyTasks}
              doneCount={totals.monthly.done}
              totalCount={totals.monthly.total}
              inventory={inventory}
              handleDeliver={handleDeliver}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
