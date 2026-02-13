import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import XpBar from '../components/XpBar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import { ensureFarmTasks, farmGoods, getFarmXpForLevel } from '../data/farmData';
import { getItemCount, removeItems } from '../services/inventoryService';

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
  }, []);

  const farmLevel = profile?.farmLevel ?? 1;
  const farmXp = profile?.farmXp ?? 0;
  const gold = profile?.stats?.gold ?? 0;
  const inventory = profile?.inventory || {};
  const farmXpTarget = getFarmXpForLevel(farmLevel);

  const tasks = profile?.farmTasks || {};
  const dailyTasks = tasks.daily?.tasks || [];
  const weeklyTasks = tasks.weekly?.tasks || [];
  const monthlyTasks = tasks.monthly?.tasks || [];

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
        `Delivered ${updatedTask.target} ${getGoodName(updatedTask.goodId)} · +${updatedTask.rewardGold}g${
          leveledUp ? ' · Farm level up!' : ''
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

  const renderTaskGroup = (label, periodKey, list, summary) => (
    <div className="rounded-2xl border border-yellow-700/20 bg-gray-950/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{label}</p>
          <p className="mt-2 text-sm text-gray-300">{summary.done}/{summary.total} complete</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {list.map((task) => {
          const owned = getItemCount(inventory, task.goodId);
          const remaining = Math.max(0, task.target - task.progress);
          const canDeliver = owned > 0 && !task.claimed;
          return (
            <div
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-700/20 bg-gray-950/70 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">{task.label}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Delivered {task.progress}/{task.target} · Owned {owned}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Rewards: +{task.rewardXp} XP · +{task.rewardGold}g
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeliver(periodKey, task.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                    task.claimed
                      ? 'bg-gray-700 text-gray-300'
                      : canDeliver
                      ? 'action-primary text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                  disabled={!canDeliver}
                >
                  {task.claimed ? 'Complete' : remaining === 0 ? 'Complete' : 'Deliver'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!MOCK_AUTH) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-6">
        Farm tasks are available only in offline mode.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm2.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
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

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Farm Level</p>
              <p className="mt-2 text-2xl font-semibold text-white">{farmLevel}</p>
              <div className="mt-3">
                <XpBar current={farmXp} target={farmXpTarget} label="Farm XP" tone="emerald" />
              </div>
            </div>
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Gold</p>
              <p className="mt-2 text-2xl font-semibold text-yellow-300">{gold}</p>
            </div>
            <div className="image-panel image-panel-housing ornament-frame p-4">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Inventory</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {farmGoods.reduce((sum, good) => sum + getItemCount(inventory, good.id), 0)} goods
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {renderTaskGroup('Daily Orders', 'daily', dailyTasks, totals.daily)}
            {renderTaskGroup('Weekly Orders', 'weekly', weeklyTasks, totals.weekly)}
            {renderTaskGroup('Monthly Orders', 'monthly', monthlyTasks, totals.monthly)}
          </div>
        </div>
      </div>
    </section>
  );
}
