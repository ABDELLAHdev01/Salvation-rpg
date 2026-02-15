import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';

export default function FarmMarketSell() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/market', { replace: true }), 0);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm2.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Market Notice</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Global Market</h1>
          <p className="mt-3 text-base text-gray-300">
            Selling farm goods now happens through the unified Global Market.
          </p>
          <Link
            to="/market"
            className="mt-6 inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
          >
            Go to Global Market
          </Link>
        </div>
      </div>
    </section>
  );
}
