import React, { useState } from 'react';
import AuthService from '../services/AuthService';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisteForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const usernameValid = /^[a-zA-Z0-9]{3,16}$/.test(username.trim());
  const passwordValid = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  const confirmValid = confirmPassword.length === 0 || password === confirmPassword;
  const strengthScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const strengthPercent = (strengthScore / 4) * 100;
  const strengthLabel =
    strengthScore <= 1 ? 'Weak' : strengthScore === 2 ? 'Fair' : strengthScore === 3 ? 'Strong' : 'Elite';
  const strengthColor =
    strengthScore <= 1 ? 'bg-red-500' : strengthScore === 2 ? 'bg-yellow-500' : 'bg-emerald-500';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!usernameValid) {
      toast.error('Username must be 3-16 letters or numbers.');
      return;
    }

    if (!passwordValid) {
      toast.error('Password must be at least 8 characters and include a number.');
      return;
    }

    try {
      setIsSubmitting(true);
      await AuthService.register(username, password);
      navigate('/login'); // Redirect to login page
      
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl p-8 shadow-xl backdrop-blur reveal glass-panel">
      <Toaster />
      <div className="flex flex-col items-center text-center">
        <img alt="Salvation Logo" src="logo.webp" className="h-28 w-auto" />
        <p className="section-kicker mt-5 text-xs uppercase tracking-[0.4em] text-yellow-500">New Arrival</p>
        <h1 className="mt-3 text-3xl font-extrabold text-white hero-title">Forge Your Account</h1>
        <p className="mt-2 text-sm text-gray-300">Claim your name and begin your legend.</p>
      </div>

      <form onSubmit={handleRegister} className="mt-8 space-y-5">
        <div>
          <label htmlFor="username" className="block text-xs uppercase tracking-[0.3em] text-gray-400">
            Username
          </label>
          <div className="mt-2">
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Choose a username"
            />
          </div>
          {!usernameValid && username.length > 0 && (
            <p className="mt-2 text-xs text-yellow-200">Use 3-16 letters or numbers only.</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs uppercase tracking-[0.3em] text-gray-400">
            Password
          </label>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Create a password"
            />
          </div>
          {!passwordValid && password.length > 0 && (
            <p className="mt-2 text-xs text-yellow-200">Use 8+ characters with at least one number.</p>
          )}
          {password.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>Password strength</span>
                <span>{strengthLabel}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-800">
                <div className={`h-full rounded-full ${strengthColor}`} style={{ width: `${strengthPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs uppercase tracking-[0.3em] text-gray-400">
            Confirm Password
          </label>
          <div className="mt-2">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Re-enter your password"
            />
          </div>
          {!confirmValid && confirmPassword.length > 0 && (
            <p className="mt-2 text-xs text-yellow-200">Passwords must match.</p>
          )}
          {confirmPassword.length > 0 && confirmValid && (
            <p className="mt-2 text-xs text-emerald-300">Passwords match.</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white ${
              isSubmitting ? 'bg-gray-700 text-gray-300' : 'action-primary'
            }`}
          >
            {isSubmitting ? 'Creating account...' : 'Start Your Adventure'}
          </button>
          <Link
            to="/login"
            className="flex w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold text-yellow-200 action-ghost"
          >
            I already have an account
          </Link>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Already a member?{' '}
        <Link to="/login" className="font-semibold text-yellow-300 hover:text-yellow-200">
          Click here to log in.
        </Link>
      </p>
    </div>
  );
}
