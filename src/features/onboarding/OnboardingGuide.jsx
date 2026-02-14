import React, { useState, useEffect, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';

const ONBOARDING_KEY = 'onboardingSeen';

const onboardingSteps = [
  {
    title: 'Welcome to Salvation',
    body: 'Start here to review your level, gold, and current buffs before you head out.',
    navHref: '/dashboard',
  },
  {
    title: 'Dispatch expeditions',
    body: 'Send a crew on an expedition and claim rewards when the timer ends.',
    navHref: '/adventure',
  },
  {
    title: 'Settle your residence',
    body: 'Upgrade your residence to unlock passive bonuses.',
    navHref: '/housing',
  },
  {
    title: 'Grow the farm',
    body: 'Buy seeds and animals, then harvest for steady gold and farm XP.',
    navHref: '/farm',
  },
  {
    title: 'Mine for resources',
    body: 'Start mining runs to gather ore and XP. Visit the store to trade materials.',
    navHref: '/mining',
  },
  {
    title: 'Manage your save',
    body: 'Your progress is stored locally. Use Load Save to manage backups.',
    navHref: '/load-save',
  },
];

const OnboardingGuide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    const username = authService.getCurrentUsername();
    const hasCharacter = characterService.hasMockCharacter(username);
    const seen = localStorage.getItem(ONBOARDING_KEY);

    if (hasCharacter && !seen) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    if (!showOnboarding) {
      if (document.body.dataset.onboarding) {
        delete document.body.dataset.onboarding;
        window.dispatchEvent(new Event('onboarding-update'));
      }
      return;
    }

    const navHref = onboardingSteps[onboardingStep]?.navHref;
    if (navHref) {
      document.body.dataset.onboarding = navHref;
      window.dispatchEvent(new Event('onboarding-update'));
    }
  }, [showOnboarding, onboardingStep]);

  useEffect(() => {
    if (!showOnboarding) {
      return;
    }
    const currentIndex = onboardingSteps.findIndex((step) => step.navHref === location.pathname);
    if (currentIndex >= 0 && currentIndex !== onboardingStep) {
      setOnboardingStep(currentIndex);
    }
  }, [location.pathname, onboardingStep, showOnboarding]);

  const handleCloseOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const handleNextStep = () => {
    if (onboardingStep >= onboardingSteps.length - 1) {
      handleCloseOnboarding();
      return;
    }
    const nextStep = Math.min(onboardingStep + 1, onboardingSteps.length - 1);
    const nextNav = onboardingSteps[nextStep]?.navHref;
    setOnboardingStep(nextStep);
    if (nextNav && location.pathname !== nextNav) {
      navigate(nextNav);
    }
  };

  const handlePrevStep = () => {
    const prevStep = Math.max(onboardingStep - 1, 0);
    const prevNav = onboardingSteps[prevStep]?.navHref;
    setOnboardingStep(prevStep);
    if (prevNav && location.pathname !== prevNav) {
      navigate(prevNav);
    }
  };

  if (!showOnboarding) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
      <div className="fixed z-50 left-4 right-4 top-24 rounded-2xl border border-yellow-700/30 bg-gray-950/95 p-5 shadow-2xl sm:left-10 sm:right-10 lg:left-72 lg:right-auto lg:w-[360px]">
        <p className="text-xs uppercase tracking-[0.35em] text-yellow-500">First steps</p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {onboardingSteps[onboardingStep]?.title}
        </h2>
        <p className="mt-3 text-sm text-gray-300">
          {onboardingSteps[onboardingStep]?.body}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>Step {onboardingStep + 1} of {onboardingSteps.length}</span>
          <button
            type="button"
            onClick={handleCloseOnboarding}
            className="text-yellow-200"
          >
            Skip
          </button>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${onboardingStep === 0 ? 'bg-gray-800 text-gray-500' : 'action-ghost text-yellow-200'
              }`}
            disabled={onboardingStep === 0}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-white action-primary"
          >
            {onboardingStep >= onboardingSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
};

export default memo(OnboardingGuide);